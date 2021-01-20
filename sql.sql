-- DROP TABLE IF EXISTS signatures;

CREATE TABLE signatures (
    contact_id UUID DEFAULT uuid_generate_v4 (),
     first VARCHAR NOT NULL CHECK (first != ''),
     last VARCHAR NOT NULL CHECK (last != ''),
     signature VARCHAR NOT NULL CHECK (signature != ''),
  signed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (contact_id)
);

INSERT INTO signatures (
    first,
    last,
    signature,
)
VALUES
    (
        'John',
        'Smith',
        'john.smith@example.com'
    )