//NÃO IMPLEMENTADO AINDA

interface Item {
  id: number,
  title: string,
  image_url: string
}

function serialize(items: Item[]) {
  items.map(item => {
    return {
    id: item.id,
    title: item.title,
    image_url: `http://192.168.0.3:3333/uploads/${item.image}`
  }
})
}