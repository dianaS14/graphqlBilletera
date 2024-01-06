const { gql } = require("apollo-server-express");

const typeDefs = gql`
  type Usuario {
    Id_estado: Int
    nombre: String
  }

  type Estado {
    nombre: String
    estado: String
  }

  type Billetera {
    Id_billetera: Int
    Id_estado: Int
    Id_usuario: Int
    monto_disponible: Float
    Usuario: Usuario
  }

  type Transaccion {
    Id_tipo_transacccion: Int!
    origen: Int!
    destino: Int!
    monto: Float!
    Id_estado: Int!
    fecha: String!
    descripcion: String!
  }

  input CreateTransaccionInput {
    Id_transaccion: Int
    Id_tipo_transaccion: Int!
    origen: Int!
    destino: Int!
    monto: Float!
    Id_estado: Int!
    fecha: String!
    descripcion: String!
  }

  type Query {
    BilleteraElectronica_Estado: [Estado]
    BilleteraElectronica_Billetera(Id_billetera: Int!): [Billetera]
  }

  type Mutation {
    createTransaccion(input: CreateTransaccionInput!): Transaccion
  }
`;

module.exports = { typeDefs };
