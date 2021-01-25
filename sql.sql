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



 CREATE TABLE users(
      user_id UUID DEFAULT uuid_generate_v4 (),
      first VARCHAR(255) NOT NULL,
      last VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )

CREATE TABLE signatures (
    id UUID DEFAULT uuid_generate_v4 (),
     signature VARCHAR NOT NULL CHECK (signature != ''),
  signed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  user_id INTEGER NOT NULL UNIQUE REFERENCES users(user_id),
    PRIMARY KEY (id)
);


DROP TABLE IF EXISTS user_profiles;
CREATE TABLE user_profiles(
profile_id UUID DEFAULT uuid_generate_v4 (),
age INT,
city VARCHAR(100),
url VARCHAR(300),
user_id uuid NOT NULL UNIQUE REFERENCES users(user_id),
PRIMARY KEY (profile_id)


insert into user_profiles (age, city, url, user_id) values (32, 'Barcelona', null ,'5dd4922f-af9c-40c9-8746-3a41782f1f09');
