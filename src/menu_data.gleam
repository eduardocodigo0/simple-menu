import gleam/int
import gleam/list

pub type PaymentMethod {
  PIX
  Money
  Credit
  Debt
}

pub type MenuItemType {
  Juices
  Sodas
  Beers
  Burguers
}

pub type MenuItem {
  MenuItem(
    name: String,
    ingredients: String,
    price: Float,
    qtd: Int,
    item_type: MenuItemType,
  )
}

pub fn get_juices(menu_items: List(MenuItem)) -> List(MenuItem) {
  menu_items
  |> list.filter(fn(item) { item.item_type == Juices })
}

pub fn get_beers(menu_items: List(MenuItem)) -> List(MenuItem) {
  menu_items
  |> list.filter(fn(item) { item.item_type == Beers })
}

pub fn get_sodas(menu_items: List(MenuItem)) -> List(MenuItem) {
  menu_items
  |> list.filter(fn(item) { item.item_type == Sodas })
}

pub fn get_burguers(menu_items: List(MenuItem)) -> List(MenuItem) {
  menu_items
  |> list.filter(fn(item) { item.item_type == Burguers })
}

pub fn get_total_price(menu_items: List(MenuItem)) -> Float {
  menu_items
  |> list.fold(0.0, fn(current, item) {
    case item.qtd {
      _ if item.qtd >= 1 -> {
        current +. { int.to_float(item.qtd) *. item.price }
      }
      _ -> current
    }
  })
}

pub fn generate_menu_items() -> List(MenuItem) {
  [
    //Sucos
    MenuItem(
      item_type: Juices,
      name: "Abacaxi 500ml",
      ingredients: "Abacaxi",
      price: 6.0,
      qtd: 0,
    ),
    MenuItem(
      item_type: Juices,
      name: "Abacaxi 1L",
      ingredients: "Abacaxi",
      price: 12.0,
      qtd: 0,
    ),
    MenuItem(
      item_type: Juices,
      name: "Abacaxi com hortelã 500ml",
      ingredients: "Abacaxi com hortelã",
      price: 6.0,
      qtd: 0,
    ),
    MenuItem(
      item_type: Juices,
      name: "Abacaxi com hortelã 1L",
      ingredients: "Abacaxi com hortelã",
      price: 12.0,
      qtd: 0,
    ),
    MenuItem(
      item_type: Juices,
      name: "Acerola 500ml",
      ingredients: "Acerola",
      price: 6.0,
      qtd: 0,
    ),
    MenuItem(
      item_type: Juices,
      name: "Acerola 1L",
      ingredients: "Acerola",
      price: 12.0,
      qtd: 0,
    ),
    MenuItem(
      item_type: Juices,
      name: "Maracuja 500ml",
      ingredients: "Maracuja",
      price: 6.0,
      qtd: 0,
    ),
    MenuItem(
      item_type: Juices,
      name: "Maracuja 1L",
      ingredients: "Maracuja",
      price: 12.0,
      qtd: 0,
    ),
    MenuItem(
      item_type: Juices,
      name: "Laranja 500ml",
      ingredients: "Laranja",
      price: 6.0,
      qtd: 0,
    ),
    MenuItem(
      item_type: Juices,
      name: "Laranja 1L",
      ingredients: "Laranja",
      price: 12.0,
      qtd: 0,
    ),
    //Cervejas
    MenuItem(
      item_type: Beers,
      name: "Skol",
      ingredients: "Skol",
      price: 5.0,
      qtd: 0,
    ),
    MenuItem(
      item_type: Beers,
      name: "Brahma",
      ingredients: "Brahma",
      price: 5.0,
      qtd: 0,
    ),
    MenuItem(
      item_type: Beers,
      name: "Antarctica",
      ingredients: "Antarctica",
      price: 5.0,
      qtd: 0,
    ),
    //Refrigeirantes
    MenuItem(
      item_type: Sodas,
      name: "Coca-cola LATA",
      ingredients: "Coca cola",
      price: 5.0,
      qtd: 0,
    ),
    MenuItem(
      item_type: Sodas,
      name: "Coca-cola 600ml",
      ingredients: "Coca cola",
      price: 7.0,
      qtd: 0,
    ),
    MenuItem(
      item_type: Sodas,
      name: "Coca-cola 1L",
      ingredients: "Coca cola",
      price: 8.0,
      qtd: 0,
    ),
    MenuItem(
      item_type: Sodas,
      name: "Coca-cola 2L",
      ingredients: "Coca cola",
      price: 12.0,
      qtd: 0,
    ),
    MenuItem(
      item_type: Sodas,
      name: "Fanta LATA",
      ingredients: "Fanta",
      price: 5.0,
      qtd: 0,
    ),
    MenuItem(
      item_type: Sodas,
      name: "Fanta 600ml",
      ingredients: "Fanta",
      price: 7.0,
      qtd: 0,
    ),
    MenuItem(
      item_type: Sodas,
      name: "Fanta 2L",
      ingredients: "Fanta",
      price: 10.0,
      qtd: 0,
    ),
    MenuItem(
      item_type: Sodas,
      name: "Sprite LATA",
      ingredients: "Sprite",
      price: 5.0,
      qtd: 0,
    ),
    MenuItem(
      item_type: Sodas,
      name: "sprite 600ml",
      ingredients: "Sprite",
      price: 7.0,
      qtd: 0,
    ),
    MenuItem(
      item_type: Sodas,
      name: "Sprite 2L",
      ingredients: "Sprite",
      price: 10.0,
      qtd: 0,
    ),
    MenuItem(
      item_type: Sodas,
      name: "Guaraná Antarctica LATA",
      ingredients: "Guaraná Antarctica",
      price: 5.0,
      qtd: 0,
    ),
    MenuItem(
      item_type: Sodas,
      name: "Guaraná Antarctica 1L",
      ingredients: "Guaraná Antarctica",
      price: 6.0,
      qtd: 0,
    ),
    MenuItem(
      item_type: Sodas,
      name: "Guaraná Antarctica 2L",
      ingredients: "Guaraná Antarctica",
      price: 10.0,
      qtd: 0,
    ),
    MenuItem(
      item_type: Sodas,
      name: "Vencetex 600ml",
      ingredients: "Vencetex",
      price: 5.0,
      qtd: 0,
    ),
    MenuItem(
      item_type: Sodas,
      name: "Vencetex 1L",
      ingredients: "Vencetex",
      price: 6.0,
      qtd: 0,
    ),
    MenuItem(
      item_type: Sodas,
      name: "Vencetex 2L",
      ingredients: "Vencetex",
      price: 8.0,
      qtd: 0,
    ),
    //Lanches
    MenuItem(
      item_type: Burguers,
      name: "Misto",
      ingredients: "Presunto e queijo",
      price: 17.0,
      qtd: 0,
    ),
    MenuItem(
      item_type: Burguers,
      name: "Bauru",
      ingredients: "Presunto, queijo e tomate",
      price: 17.0,
      qtd: 0,
    ),
    MenuItem(
      item_type: Burguers,
      name: "Paulista",
      ingredients: "Bife, queijo, tomate e alface",
      price: 29.0,
      qtd: 0,
    ),
    MenuItem(
      item_type: Burguers,
      name: "Americano",
      ingredients: "Bife, presunto, queijo, ovo, tomate e alface",
      price: 32.0,
      qtd: 0,
    ),
    MenuItem(
      item_type: Burguers,
      name: "Calabresa egg",
      ingredients: "Presunto, queijo, bacon, calabresa, ovo, tomate e alface",
      price: 22.0,
      qtd: 0,
    ),
    MenuItem(
      item_type: Burguers,
      name: "Hot dog simples",
      ingredients: "2 salsichas, milho, batata palha, tomate e alface",
      price: 15.0,
      qtd: 0,
    ),
    MenuItem(
      item_type: Burguers,
      name: "Hot dog especial",
      ingredients: "2 salsichas, milho, batata palha, bacon, calabresa, tomate e alface",
      price: 17.0,
      qtd: 0,
    ),
    MenuItem(
      item_type: Burguers,
      name: "X-Palmito",
      ingredients: "Presunto, queijo, palmito, tomate e  alface",
      price: 20.0,
      qtd: 0,
    ),
    MenuItem(
      item_type: Burguers,
      name: "X-Burguer",
      ingredients: "2 Hambúrgueres, queijo e tomate",
      price: 17.0,
      qtd: 0,
    ),
    MenuItem(
      item_type: Burguers,
      name: "X-Salada",
      ingredients: "2 Hambúrgueres, queijo e tomate",
      price: 17.0,
      qtd: 0,
    ),
    MenuItem(
      item_type: Burguers,
      name: "X-Egg",
      ingredients: "2 Hambúrgueres, queijo e tomate",
      price: 18.0,
      qtd: 0,
    ),
    MenuItem(
      item_type: Burguers,
      name: "X-Bacon",
      ingredients: "2 Hambúrgueres, queijo e tomate",
      price: 22.0,
      qtd: 0,
    ),
    MenuItem(
      item_type: Burguers,
      name: "X-Bacon com calabresa",
      ingredients: "2 Hambúrgueres, queijo e tomate",
      price: 22.0,
      qtd: 0,
    ),
    MenuItem(
      item_type: Burguers,
      name: "X-Salame",
      ingredients: "2 Hambúrgueres, queijo e tomate",
      price: 22.0,
      qtd: 0,
    ),
    MenuItem(
      item_type: Burguers,
      name: "X-Calabresa",
      ingredients: "2 Hambúrgueres, queijo e tomate",
      price: 22.0,
      qtd: 0,
    ),
    MenuItem(
      item_type: Burguers,
      name: "X-Tudo promoção",
      ingredients: "2 Hambúrgueres, queijo e tomate",
      price: 22.0,
      qtd: 0,
    ),
    MenuItem(
      item_type: Burguers,
      name: "X-Tudo especial",
      ingredients: "2 Hambúrgueres, queijo e tomate",
      price: 24.0,
      qtd: 0,
    ),
    MenuItem(
      item_type: Burguers,
      name: "X-Tudo com bife",
      ingredients: "2 Hambúrgueres, queijo e tomate",
      price: 34.0,
      qtd: 0,
    ),
    MenuItem(
      item_type: Burguers,
      name: "X-Tudo aberto",
      ingredients: "2 Hambúrgueres, queijo e tomate",
      price: 26.0,
      qtd: 0,
    ),
    MenuItem(
      item_type: Burguers,
      name: "Americano Aberto",
      ingredients: "2 Hambúrgueres, queijo e tomate",
      price: 34.0,
      qtd: 0,
    ),
    MenuItem(
      item_type: Burguers,
      name: "X-Frango desfiado",
      ingredients: "2 Hambúrgueres, queijo e tomate",
      price: 25.0,
      qtd: 0,
    ),
    MenuItem(
      item_type: Burguers,
      name: "Hambúrguer simples",
      ingredients: "2 Hambúrgueres, queijo e tomate",
      price: 15.0,
      qtd: 0,
    ),
  ]
}
