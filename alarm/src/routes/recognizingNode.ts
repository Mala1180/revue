import { recognizingNodeController } from '../controller/recognizingNode.js'
import express, { Request, Response, Router } from 'express'
import { RecognizingNode } from '@domain/alarm-system/core/RecognizingNode.js'
import HttpStatusCode from '@utils/HttpStatusCode.js'

export const recognizingNodeRouter: Router = express.Router()

recognizingNodeRouter.route('/:id').get((req: Request, res: Response): void => {
  recognizingNodeController
    .getRecognizingNodeById(req.params.id)
    .then((recognizingNode: RecognizingNode): void => {
      res.status(HttpStatusCode.OK).send(recognizingNode)
    })
    .catch((): void => {
      res.send({ error: 'No recognizing node found' })
    })
})

recognizingNodeRouter.route('/').get((req: Request, res: Response): void => {
  recognizingNodeController
    .getRecognizingNodes()
    .then((recognizingNodes: RecognizingNode[]): void => {
      res.status(HttpStatusCode.OK).send(recognizingNodes)
    })
    .catch((): void => {
      res.send({ error: 'No recognizing nodes found' })
    })
})

recognizingNodeRouter.route('/').post((req: Request, res: Response): void => {
  recognizingNodeController
    .createRecognizingNode(req)
    .then((): void => {
      res.status(HttpStatusCode.CREATED).send({ success: 'Recognizing node created' })
    })
    .catch((): void => {
      res.send({ error: 'Recognizing node not created' })
    })
})
recognizingNodeRouter.route('/').put((req: Request, res: Response): void => {
  recognizingNodeController
    .updateRecognizingNode(req)
    .then((): void => {
      res.status(HttpStatusCode.OK).send({ success: 'Recognizing node correctly updated' })
    })
    .catch((): void => {
      res.send({ error: 'Recognizing node not updated' })
    })
})

recognizingNodeRouter.route('/').delete((req: Request, res: Response): void => {
  recognizingNodeController
    .deleteRecognizingNode(req.body.id)
    .then((): void => {
      res.status(HttpStatusCode.OK).send({ success: 'Recognizing node correctly deleted' })
    })
    .catch((): void => {
      res.send({ error: 'Recognizing node not deleted' })
    })
})
