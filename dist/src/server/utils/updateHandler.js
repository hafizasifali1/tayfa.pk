"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handlePatchUpdate = handlePatchUpdate;
const db_1 = require("../../db");
const schema_1 = require("../../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const uuid_1 = require("uuid");
async function handlePatchUpdate(options) {
    const { table, id, data, userId, module, allowedFields, enumValidators } = options;
    if (!id) {
        throw new Error('Missing ID in request');
    }
    // 1. Filter allowed fields
    const updateData = {};
    for (const key in data) {
        if (allowedFields && !allowedFields.includes(key))
            continue;
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
    const [oldRecord] = await db_1.db.select().from(table).where((0, drizzle_orm_1.eq)(table.id, id));
    if (!oldRecord) {
        throw new Error(`${module} not found`);
    }
    // 4. Perform Update
    // Ensure updatedAt is always set to a new Date object
    if ('updatedAt' in table) {
        updateData.updatedAt = new Date();
    }
    await db_1.db.update(table)
        .set(updateData)
        .where((0, drizzle_orm_1.eq)(table.id, id));
    // 5. Audit Log
    await db_1.db.insert(schema_1.auditLogs).values({
        id: (0, uuid_1.v4)(),
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
    const [updatedRecord] = await db_1.db.select().from(table).where((0, drizzle_orm_1.eq)(table.id, id));
    return updatedRecord;
}
