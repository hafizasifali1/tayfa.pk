export interface AttributeValue {
  id: string;
  attributeId: string;
  value: string;
  slug: string;
  colorCode?: string;
  imageUrl?: string;
  displayOrder: number;
  isActive: boolean;
}

export interface Attribute {
  id: string;
  name: string;
  slug: string;
  displayType: 'button' | 'color_swatch' | 'dropdown' | 'radio';
  description?: string;
  isRequired: boolean;
  isActive: boolean;
  displayOrder: number;
  showOnProductPage: boolean;
  values: AttributeValue[];
  createdAt: string;
  updatedAt: string;
}
