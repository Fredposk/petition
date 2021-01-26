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


DROP TABLE IF EXISTS users;
 CREATE TABLE users(
      user_id UUID DEFAULT uuid_generate_v4 () PRIMARY KEY,
      first VARCHAR(255) NOT NULL,
      last VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );


DROP TABLE IF EXISTS signatures;
CREATE TABLE signatures (
    id UUID DEFAULT uuid_generate_v4 (),
     signature VARCHAR NOT NULL CHECK (signature != ''),
  signed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  user_id UUID NOT NULL UNIQUE REFERENCES users(user_id),
    PRIMARY KEY (id)
);


DROP TABLE IF EXISTS user_profiles;
CREATE TABLE user_profiles(
profile_id UUID DEFAULT uuid_generate_v4 (),
age INT,
city VARCHAR(100),
url VARCHAR(300),
user_id UUID NOT NULL UNIQUE REFERENCES users(user_id),
PRIMARY KEY (profile_id)
);

insert into user_profiles (age, city, url, user_id) values (32, 'Barcelona', null ,'5dd4922f-af9c-40c9-8746-3a41782f1f09');


SELECT           *
FROM             users
FULL OUTER JOIN signatures ON users.user_id = signatures.user_id
FULL OUTER JOIN user_profiles ON signatures.user_id = user_profiles.user_id
WHERE            users.user_id = '18d504b4-70cb-4355-8525-71b41a425831';


SELECT users.first, users.last, user_profiles.age, user_profiles.city, user_profiles.url
FROM  users
LEFT JOIN signatures ON users.user_id = signatures.user_id
LEFT  JOIN user_profiles ON signatures.user_id = user_profiles.user_id