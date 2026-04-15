import { db } from '../../db';
import { auditLogs } from '../../db/schema';
import { eq, sql } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

export interface UpdateOptions {
  table: any;
  id: string;
  data: any;
  userId: string;
  module: string;
  allowedFields?: string[];
  enumValidators?: Record<string, string[]>;
}

export async function handlePatchUpdate(options: UpdateOptions) {
  const { table, id, data, userId, module, allowedFields, enumValidators } = options;

  if (!id) {
    throw new Error('Missing ID in request');
  }

  // 1. Filter allowed fields
  const updateData: any = {};
  for (const key in data) {
    if (allowedFields && !allowedFields.includes(key)) continue;
    
    // Prevent overwriting with null unless explicitly intended (though PATCH usually means only provided fields)
    // Here we assume if it's in the body, the user wants to set it.
    // But we can add a check to skip undefined.
    if (data[key] !== undefined) {
      updateData[key] = data[key];
    }
  }

  if (Object.keys(updateData).length === 0) {
    throw new Error('No valid fields provided for update');
  }

  // 2. Validate Enums
  if (enumValidators) {
    for (const field in enumValidators) {
      if (updateData[field] && !enumValidators[field].includes(updateData[field])) {
        throw new Error(`Invalid value for ${field}. Allowed: ${enumValidators[field].join(', ')}`);
      }
    }
  }

  // 3. Get old data for audit log
  const [oldRecord] = await db.select().from(table).where(eq(table.id, id));
  if (!oldRecord) {
    throw new Error(`${module} not found`);
  }

  // 4. Perform Update
  // Ensure updatedAt is always set to a new Date object
  if ('updatedAt' in table) {
    updateData.updatedAt = new Date();
  }

  await db.update(table)
    .set(updateData)
    .where(eq(table.id, id));

  // 5. Audit Log
  await db.insert(auditLogs).values({
    id: uuidv4(),
    userId: userId || 'system',
    action: `updated_${module.toLowerCase()}`,
    module: module,
    details: {
      recordId: id,
      changedFields: Object.keys(updateData),
      oldData: oldRecord,
      newData: updateData
    }
  });

  // 6. Return updated record
  const [updatedRecord] = await db.select().from(table).where(eq(table.id, id));
  return updatedRecord;
}
