const { gql } = require("apollo-server-express");

const typeDefs = gql`


type Usuario {
    Id_estado: Estado
    nombre: String
  }

  type Estado {
    Id_estado: ID
    nombre: String
    estado: String
  }

  type Billetera {
    Id_billetera: ID
    Id_estado: Estado
    Id_usuario: Usuario
    monto_disponible: Float
  }

  type Transaccion {
    Id_transacccion: ID
    Id_tipo_transacccion: TipoTransaccion
    origen: Billetera
    destino: Billetera
    monto: Float
    Id_estado: Estado
    descripcion: String
  }

  type TipoTransaccion {
    Id_transacccion: ID
    Id_estado: Estado
    descripcion: String
    nombre: String
  }

  input CreateTransaccionInput {
    Id_transaccion: Int
    Id_tipo_transaccion: Int!
    origen: Int
    destino: Int
    monto: Float
    Id_estado: Int
    descripcion: String
  }



  type Query {
    billeteraElectronicaEstado: [Estado]
    billeteraElectronicaBilletera(idBilletera: Int!): [Billetera]
  }

  type Mutation {
    createTransaccion(input: CreateTransaccionInput!): Transaccion
  }
`;

module.exports = { typeDefs };