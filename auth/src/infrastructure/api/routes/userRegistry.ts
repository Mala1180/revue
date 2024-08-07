import express, { Request, Response, Router } from 'express'
import HttpStatusCode from '@common/utils/HttpStatusCode.js'
import { registryController } from '@/infrastructure/api/controllers/userRegistry.js'
import { User } from '@/domain/core/User.js'
import { UserId } from '@/domain/core/UserId.js'
import { ZodUserPresenter } from '@/presentation/api/impl/ZodUserPresenter.js'
import { UserPresenter } from '@/presentation/api/UserPresenter'
import { UserInsertion, UserUpdate } from '@/presentation/api/schemas/UserSchemas'

export const userRegistry: Router = express.Router()
const userPresenter: UserPresenter = new ZodUserPresenter()

userRegistry.route('/').get((req: Request, res: Response): void => {
  registryController
    .getUsers()
    .then((users: User[]): void => {
      res.status(HttpStatusCode.OK).send(users)
    })
    .catch((err: Error): void => {
      res.status(HttpStatusCode.BAD_REQUEST).send(err)
    })
})

userRegistry.route('/:id').get((req: Request, res: Response): void => {
  registryController
    .getUserById(req.params.id)
    .then((user: User): void => {
      res.status(HttpStatusCode.OK).send(user)
    })
    .catch((err: Error): void => {
      res.status(HttpStatusCode.BAD_REQUEST).send(err.message)
    })
})

userRegistry.route('/').post((req: Request, res: Response): void => {
  try {
    const userMsg: UserInsertion = userPresenter.parseInsertion(req.body)
    registryController
      .createUser(userMsg.username, userMsg.password, userMsg.permissions)
      .then((userId: UserId): void => {
        res.status(HttpStatusCode.CREATED).send(userId)
      })
  } catch (err) {
    res.status(HttpStatusCode.BAD_REQUEST).send(err)
  }
})

userRegistry.route('/:id').put((req: Request, res: Response): void => {
  try {
    const userMsg: UserUpdate = userPresenter.parseUpdate(req.body)
    registryController.updateUser(req.params.id, userMsg.permissions).then((): void => {
      res.status(HttpStatusCode.OK).send('User updated')
    })
  } catch (err) {
    res.status(HttpStatusCode.BAD_REQUEST).send(err)
  }
})

userRegistry.route('/:id').delete((req: Request, res: Response): void => {
  registryController
    .deleteUser(req.params.id)
    .then((): void => {
      res.status(HttpStatusCode.OK).send('User deleted')
    })
    .catch((err: Error): void => {
      res.status(HttpStatusCode.BAD_REQUEST).send(err)
    })
})
