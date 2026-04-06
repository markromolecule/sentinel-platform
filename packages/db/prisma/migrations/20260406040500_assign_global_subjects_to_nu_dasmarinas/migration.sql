-- Update all subjects with NULL institution_id to NU Dasmariñas institution ID
UPDATE subjects SET institution_id = '7e34b907-6ed9-4d30-852d-34174e074ca4' WHERE institution_id IS NULL;
