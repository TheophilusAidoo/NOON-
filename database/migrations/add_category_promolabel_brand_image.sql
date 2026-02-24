-- Run this if you have an existing database and need to add the new columns
-- Categories: promoLabel | Brands: image
-- Skip any ALTER that fails (column may already exist)

ALTER TABLE categories ADD COLUMN promoLabel VARCHAR(191) NULL;
ALTER TABLE brands ADD COLUMN image VARCHAR(191) NULL;
