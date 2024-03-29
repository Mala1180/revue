db = new Mongo().getDB('auth')

db.createCollection('user')

db.user.insertMany([
  {
    _id: ObjectId('aaaaaaaaaaaaaaaaaaaaaaaa'),
    name: 'Mario',
    surname: 'Rossi',
    username: 'user',
    password: '$2a$10$fsc2lVyx5JvVtmw9s4K.UOotFj5UU7PUaAF14mcCRnXCQbcMx1VcC', // user hashed
    token: '',
    refreshToken: '',
    contacts: [
      {
        value: '3333333333',
        type: 'SMS'
      }
    ],
    deviceIds: [
      {
        type: 'CAMERA',
        code: 'cam-01'
      },
      {
        type: 'SENSOR',
        code: 'sen-01'
      },
      {
        type: 'CAMERA',
        code: 'cam-02'
      },
      {
        type: 'SENSOR',
        code: 'sen-02'
      }
    ]
  }
])
