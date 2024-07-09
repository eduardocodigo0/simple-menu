import gleam/float
import gleam/int
import gleam/list
import lustre
import lustre/attribute
import lustre/effect
import lustre/element
import lustre/element/html
import lustre/event
import menu_data

pub type Model {
  Model(
    menu: List(menu_data.MenuItem),
    payment: menu_data.PaymentMethod,
    address: String,
  )
}

pub type Msg {
  AddItem(item_name: String)
  RemoveItem(item_name: String)
  UpdatePayment(payment: menu_data.PaymentMethod)
  UpdateAddress(addrs: String)
  SendOrder
}

pub fn main() {
  let app = lustre.application(init, update, view)
  let assert Ok(_) = lustre.start(app, "#app", Nil)

  Nil
}

pub fn view(model: Model) -> element.Element(Msg) {
  let styles = [#("width", "100vw"), #("height", "100vh"), #("padding", "2rem")]

  let total_price = menu_data.get_total_price(model.menu)
  let beers = menu_data.get_beers(model.menu)
  let sodas = menu_data.get_sodas(model.menu)
  let burguers = menu_data.get_burguers(model.menu)
  let juices = menu_data.get_juices(model.menu)

  html.div([attribute.style(styles)], [
    html.h1([], [element.text("🚀 Pedido rápido! 💫")]),
    html.h6([], [
      html.a([attribute.href("#Sucos")], [element.text("Sucos")]),
      html.a([attribute.href("#Cervejas")], [element.text("Cervejas")]),
      html.a([attribute.href("#Refrigerantes")], [element.text("Refrigerantes")]),
      html.a([attribute.href("#Lanches")], [element.text("Lanches")]),
    ]),
    html.hr([]),
    html.h3([attribute.id("Sucos")], [element.text("🍍 Sucos 🍍")]),
    html.div(
      [],
      list.map(juices, fn(juice) {
        html.div([], [
          html.br([]),
          html.button([event.on_click(RemoveItem(juice.name))], [
            element.text("Remover"),
          ]),
          element.text(" " <> int.to_string(juice.qtd) <> " "),
          html.button([event.on_click(AddItem(juice.name))], [
            element.text("Adicionar"),
          ]),
          element.text(" Preço: R$" <> float.to_string(juice.price) <> " - "),
          html.b([], [element.text(juice.name)]),
        ])
      }),
    ),
    html.br([]),
    html.hr([]),
    html.h3([attribute.id("Cervejas")], [element.text("🍺 Cervejas 🍺")]),
    html.div(
      [],
      list.map(beers, fn(beer) {
        html.div([], [
          html.br([]),
          html.button([event.on_click(RemoveItem(beer.name))], [
            element.text("Remover"),
          ]),
          element.text(" " <> int.to_string(beer.qtd) <> " "),
          html.button([event.on_click(AddItem(beer.name))], [
            element.text("Adicionar"),
          ]),
          element.text(" Preço: R$" <> float.to_string(beer.price) <> " - "),
          html.b([], [element.text(beer.name)]),
        ])
      }),
    ),
    html.br([]),
    html.hr([]),
    html.h3([attribute.id("Refrigerantes")], [
      element.text("🥤 Refrigerantes 🥤"),
    ]),
    html.div(
      [],
      list.map(sodas, fn(soda) {
        html.div([], [
          html.br([]),
          html.button([event.on_click(RemoveItem(soda.name))], [
            element.text("Remover"),
          ]),
          element.text(" " <> int.to_string(soda.qtd) <> " "),
          html.button([event.on_click(AddItem(soda.name))], [
            element.text("Adicionar"),
          ]),
          element.text(" Preço: R$" <> float.to_string(soda.price) <> " - "),
          html.b([], [element.text(soda.name)]),
        ])
      }),
    ),
    html.br([]),
    html.hr([]),
    html.h3([attribute.id("Lanches")], [element.text("🍔 Lanches 🍔")]),
    html.div(
      [],
      list.map(burguers, fn(burguer) {
        html.div([], [
          html.br([]),
          html.button([event.on_click(RemoveItem(burguer.name))], [
            element.text("Remover"),
          ]),
          element.text(" " <> int.to_string(burguer.qtd) <> " "),
          html.button([event.on_click(AddItem(burguer.name))], [
            element.text("Adicionar"),
          ]),
          element.text(" Preço: R$" <> float.to_string(burguer.price) <> " - "),
          html.b([], [element.text(burguer.name)]),
          element.text(" - Ingredientes: "),
          html.i([], [element.text(burguer.ingredients)]),
        ])
      }),
    ),
    html.br([]),
    html.hr([]),
    html.h3([], [element.text("Finalizar pedido 🖊️")]),
    html.div([], [
      html.p([], [
        element.text(
          "Valor total do pedido = R$" <> float.to_string(total_price),
        ),
      ]),
      html.p([], [element.text("Endereço da entrega:")]),
      html.input([attribute.value(model.address), event.on_input(UpdateAddress)]),
      html.p([], [element.text("Modo de pagamento:")]),
      html.div([], [
        html.input([
          attribute.type_("checkbox"),
          attribute.value("PIX"),
          attribute.checked(model.payment == menu_data.PIX),
          event.on_click(UpdatePayment(menu_data.PIX)),
        ]),
        element.text("PIX"),
      ]),
      html.div([], [
        html.input([
          attribute.type_("checkbox"),
          attribute.value("Dinheiro"),
          attribute.checked(model.payment == menu_data.Money),
          event.on_click(UpdatePayment(menu_data.Money)),
        ]),
        element.text("Dinheiro"),
      ]),
      html.div([], [
        html.input([
          attribute.type_("checkbox"),
          attribute.value("Cartão de débito"),
          attribute.checked(model.payment == menu_data.Debt),
          event.on_click(UpdatePayment(menu_data.Debt)),
        ]),
        element.text("Cartão de débito"),
      ]),
      html.div([], [
        html.input([
          attribute.type_("checkbox"),
          attribute.value("Cartão de crédito"),
          attribute.checked(model.payment == menu_data.Credit),
          event.on_click(UpdatePayment(menu_data.Credit)),
        ]),
        element.text("Cartão de crédito"),
      ]),
      html.br([]),
      html.button([event.on_click(SendOrder)], [element.text("Enviar pedido")]),
      html.br([]),
      html.br([]),
      html.i([], [
        element.text("Criado por eduardocodigo0 - "),
        html.a([attribute.href("https://github.com/eduardocodigo0/")], [
          element.text("GitHub"),
        ]),
      ]),
    ]),
  ])
}

pub fn update(model: Model, msg: Msg) -> #(Model, effect.Effect(Msg)) {
  case msg {
    AddItem(item) -> #(add_item(model, item), effect.none())
    RemoveItem(item) -> #(remove_item(model, item), effect.none())
    UpdatePayment(method) -> #(update_payment(model, method), effect.none())
    UpdateAddress(addr) -> #(update_address(model, addr), effect.none())
    _ -> #(model, effect.none())
  }
}

pub fn init(_flags) -> #(Model, effect.Effect(Msg)) {
  #(Model(menu_data.generate_menu_items(), menu_data.Money, ""), effect.none())
}

fn add_item(model: Model, item_name: String) -> Model {
  let new_menu_list =
    list.map(model.menu, fn(item) {
      case item.name == item_name {
        True if item.qtd < 100 -> menu_data.MenuItem(..item, qtd: item.qtd + 1)
        _ -> item
      }
    })

  Model(..model, menu: new_menu_list)
}

fn remove_item(model: Model, item_name: String) -> Model {
  let new_menu_list =
    list.map(model.menu, fn(item) {
      case item.name == item_name {
        True if item.qtd > 0 -> menu_data.MenuItem(..item, qtd: item.qtd - 1)
        _ -> item
      }
    })

  Model(..model, menu: new_menu_list)
}

fn update_payment(model: Model, payment: menu_data.PaymentMethod) -> Model {
  Model(..model, payment: payment)
}

fn update_address(model: Model, addr: String) -> Model {
  Model(..model, address: addr)
}
