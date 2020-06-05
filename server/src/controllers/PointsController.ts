import {Request, Response} from 'express'
import knex from '../database/connection'

class PointsController {
  async index(req: Request, res: Response) {
    const { uf, city, items } = req.query
    
    const parsedItems = String(items)
      .split(',')
      .map(item=> Number(item.trim()))

    const points = await knex('points')
      .join('point_items', 'points.id', '=', 'point_items.point_id')
      .whereIn('point_items.item_id', parsedItems)
      .where('city', String(city))
      .where('uf', String(uf))
      .distinct() // somente distintos, com id iiguals vem 1 vez so
      .select('points.*')
      
      const serializedPoints = points.map(point=> {
        return {
          ...point,
          image_url: `http://192.168.0.3:3333/uploads/${point.image}`
        }
      })


    // na nos ids da tabela(1) em que tem um item igual oque recebe no filtro(2)
    return res.json(serializedPoints)


}

  async show(req:Request, res:Response){
    const { id } = req.params;
    const trx = await knex.transaction();

    const point = await trx('points').where('id', id).first();

    if (!point) {
      return res.status(400).json({erro: 'Point not found'})
    }
    /* join, 1 a tabela q tem as relacoes 2 aonde o x da tabela 
    citada q procura 3 é igual 4 ao id da tabela de relações
   
    basicamente relaciono as duas listas e uso acomparação 
    where pra pegar a q tem o id do meu param.
    dai usando meu where na tabela de relação ja me manda os dados do join. 
   */
    const items = await trx('items')
      .join('point_items', 'items.id', '=', 'point_items.item_id')
      .where('point_items.point_id', '=', id).select('title')
    trx.commit();

    const serializedPoint = {
        ...point,
        image_url: `http://192.168.0.3:3333/uploads/${point.image}`
    }

    return res.json({
      point: serializedPoint,
      items
    })

  }

  async create(req:Request, res:Response) {

    const {
      name,
      email,
      whatsapp,
      latitude,
      longitude,
      city,
      uf,
      items
    } = req.body;
      // uso isso ao inves do knex pra fazer os dois dependentes, precisa rodar os dois

    const point = {
      image: `${req.file.filename}`,
      name,
      email,
      whatsapp,
      latitude,
      longitude,
      city,
      uf
    }
      
    const trx = await knex.transaction();

    const insertedIds = await trx('points').insert(point)
      
    const point_id = insertedIds[0];
        
    const pointItems = items
      .split(',')
      .map((item:string) => Number(item.trim()) )
      .map((item_id: number)=> {
        return {
          item_id,
          point_id
        }
      })  
 
    await trx('point_items').insert(pointItems)

    await trx.commit()

    return res.json({
      id: point_id,
      ...point,
    })

  }
}

export default new PointsController();
