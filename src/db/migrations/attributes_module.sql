-- SQL Migrations for Attributes Module
-- Database: tayfa

-- Table 1: attributes
CREATE TABLE IF NOT EXISTS attributes (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  display_type ENUM('button', 'color_swatch', 'dropdown', 'radio') DEFAULT 'button',
  description TEXT,
  is_required TINYINT(1) DEFAULT 0,
  is_active TINYINT(1) DEFAULT 1,
  display_order INT DEFAULT 0,
  show_on_product_page TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_slug (slug),
  INDEX idx_active (is_active)
);

-- Table 2: attribute_values
CREATE TABLE IF NOT EXISTS attribute_values (
  id CHAR(36) PRIMARY KEY,
  attribute_id CHAR(36) NOT NULL,
  value VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL,
  color_code VARCHAR(20) DEFAULT NULL,
  image_url TEXT DEFAULT NULL,
  display_order INT DEFAULT 0,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (attribute_id) REFERENCES attributes(id) ON DELETE CASCADE,
  INDEX idx_attribute (attribute_id),
  UNIQUE KEY unique_value_per_attribute (attribute_id, slug)
);

-- Table 3: product_attributes
CREATE TABLE IF NOT EXISTS product_attributes (
  id CHAR(36) PRIMARY KEY,
  product_id CHAR(36) NOT NULL,
  attribute_id CHAR(36) NOT NULL,
  value_id CHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (attribute_id) REFERENCES attributes(id) ON DELETE CASCADE,
  FOREIGN KEY (value_id) REFERENCES attribute_values(id) ON DELETE CASCADE,
  UNIQUE KEY unique_product_attribute_value (product_id, attribute_id, value_id),
  INDEX idx_product (product_id)
);
