const {
  ApolloClient,
  gql,
  createHttpLink,
  InMemoryCache,
} = require("@apollo/client");

// Configura el cliente de Apollo para comunicarse con la API GraphQL de Hasura
const httpLink = createHttpLink({
  uri: "https://comic-grouper-70.hasura.app/v1/graphql",
  headers: {
    "x-hasura-admin-secret":
      "o71AV55RsMJFVMOq70BHWOti8V1EL9ZbSBTJiC3NPLavi53ifnVL7ZWEWxiPPp6Z",
  },
});

const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});

const resolvers = {
  Query: {
    billeteraElectronicaEstado: async () => {
      try {
        const { data } = await client.query({
          query: gql`
            query {
              BilleteraElectronica_Estado {
                nombre
                estado
              }
            }
          `,
        });

        return data.BilleteraElectronica_Estado;
      } catch (error) {
        throw new Error("Error al obtener estados desde Hasura");
      }
    },
    billeteraElectronicaBilletera: async (_, { idBilletera }) => {
      const { data: billeteraOrigen } = await client.query({
        query: gql`
          query ($Id_billetera: Int!) @cached {
            BilleteraElectronica_Billetera(
              where: { Id_billetera: { _eq: $Id_billetera } }
            ) {
              Id_estado
              monto_disponible
              Usuario {
                Id_estado
              }
            }
          }
        `,
        variables: {
          Id_billetera: origen,
        },
      });
    },
  },
  Mutation: {
    createTransaccion: async (_, { input }) => {
      try {
        const {
          Id_estado,
          Id_transaccion,
          destino,
          monto,
          origen,
          descripcion,
        } = input;

       

        const { data: billeteraOrigen } = await client.query({
          query: gql`
            query ($Id_billetera: Int!) @cached {
              BilleteraElectronica_Billetera(
                where: { Id_billetera: { _eq: $Id_billetera } }
              ) {
                Id_estado
                monto_disponible
                Usuario {
                  Id_estado
                }
              }
            }
          `,
          variables: {
            Id_billetera: origen,
          },
        });

        const { data: billeteraDestino } = await client.query({
          query: gql`
            query ($Id_billetera: Int!) @cached {
              BilleteraElectronica_Billetera(
                where: { Id_billetera: { _eq: $Id_billetera } }
              ) {
                Id_estado
                monto_disponible
                Usuario {
                  Id_estado
                }
              }
            }
          `,
          variables: {
            Id_billetera: destino,
          },
        });

        if (!billeteraOrigen.BilleteraElectronica_Billetera[0]) {
          throw new Error("No  se encontro la billetera origen");
        }

        if (!billeteraDestino.BilleteraElectronica_Billetera[0]) {
          throw new Error("No  se encontro la billetera destino");
        }

        const estadoBilleteraOrigen =
          billeteraOrigen.BilleteraElectronica_Billetera[0].Id_estado;
        const estadoBilleteraDestino =
          billeteraDestino.BilleteraElectronica_Billetera[0].Id_estado;
        const estadoBilleteraRequerido = 1;
        const montoDisponibleOrigen =
          billeteraOrigen.BilleteraElectronica_Billetera[0].monto_disponible;
        const estadoUsuarioOrigen =
          billeteraOrigen.BilleteraElectronica_Billetera[0].Usuario.Id_estado;
        const estadoUsuarioDestino =
          billeteraDestino.BilleteraElectronica_Billetera[0].Usuario.Id_estado;
        const estadoUsuarioRequerido = 9;
        const montoDisponibleDestino =
          billeteraDestino.BilleteraElectronica_Billetera[0].monto_disponible;

        if (estadoBilleteraOrigen !== estadoBilleteraRequerido) {
          throw new Error("La billetera origen no está en el estado activo");
        }

        if (estadoBilleteraDestino !== estadoBilleteraRequerido) {
          throw new Error("La billetera destino no está en el estado activo");
        }

        if (estadoUsuarioOrigen !== estadoUsuarioRequerido) {
          throw new Error("El Usuario origen esta inactivo");
        }

        if (estadoUsuarioDestino !== estadoUsuarioRequerido) {
          throw new Error("El Usuario destino esta inactivo");
        }

        if (monto > montoDisponibleOrigen) {
          throw new Error(
            "No tiene el dinero suficiente para hacer la transaccion"
          );
        }

        //se crea el debito
        const { data } = await client.mutate({
          mutation: gql`
            mutation CrearTransaccion(
              $Id_estado: Int!
              $Id_tipo_transaccion: Int!
              $destino: Int!
              $monto: numeric!
              $origen: Int!
              $descripcion: String!
            ) {
              insert_BilleteraElectronica_Transaccion(
                objects: {
                  Id_estado: $Id_estado
                  Id_tipo_transaccion: $Id_tipo_transaccion
                  destino: $destino
                  monto: $monto
                  origen: $origen
                  descripcion: $descripcion
                }
              ) {
                returning {
                  Id_estado
                  Id_tipo_transaccion
                  Id_transaccion
                  descripcion
                }
              }
            }
          `,
          variables: {
            Id_estado: 3,
            Id_tipo_transaccion: 1,
            destino: destino,
            monto: monto,
            origen: origen,
            descripcion:descripcion,
          },
        });

        try {
              // se crea el credito
              const { data: crearCredito } = await client.mutate({
                mutation: gql`
                  mutation crearCredito(
                    $Id_estado: Int!
                    $Id_tipo_transaccion: Int!
                    $destino: Int!
                    $monto: numeric!
                    $origen: Int!
                    $descripcion: String!
                  ) {
                    insert_BilleteraElectronica_Transaccion(
                      objects: {
                        Id_estado: $Id_estado
                        Id_tipo_transaccion: $Id_tipo_transaccion
                        destino: $destino
                        monto: $monto
                        origen: $origen
                        descripcion: $descripcion
                      }
                    ) {
                      returning {
                        Id_estado
                        Id_tipo_transaccion
                        Id_transaccion
                        descripcion
                      }
                    }
                  }
                `,
                variables: {
                  Id_estado: 4,
                  Id_tipo_transaccion: 2,
                  destino: destino,
                  monto: monto,
                  origen: origen,
                  descripcion: descripcion,
                },
              });
    
              // se actualizan los montos
              const { data: updateOrigen } = await client.mutate({
                mutation: gql`
                  mutation updateOrigen(
                    $Id_billetera: Int!
                    $monto_disponible: numeric
                  ) {
                    update_BilleteraElectronica_Billetera(
                      where: { Id_billetera: { _eq: $Id_billetera } }
                      _set: { monto_disponible: $monto_disponible }
                    ) {
                      returning {
                        Id_billetera
                        Id_estado
                        monto_disponible
                      }
                    }
                  }
                `,
                variables: {
                  Id_billetera: origen,
                  monto_disponible: montoDisponibleOrigen - monto,
                },
              });
    
              const { data: updateDestino } = await client.mutate({
                mutation: gql`
                  mutation updateDestino(
                    $Id_billetera: Int!
                    $monto_disponible: numeric
                  ) {
                    update_BilleteraElectronica_Billetera(
                      where: { Id_billetera: { _eq: $Id_billetera } }
                      _set: { monto_disponible: $monto_disponible }
                    ) {
                      returning {
                        Id_billetera
                        Id_estado
                        monto_disponible
                      }
                    }
                  }
                `,
                variables: {
                  Id_billetera: destino,
                  monto_disponible: montoDisponibleDestino + monto,
                },
              });
    
              const { data: updateEstadoTransacccionAprobada } =
                await client.mutate({
                  mutation: gql`
                    mutation updateTransaccion($Id_transaccion: Int!) {
                      update_BilleteraElectronica_Transaccion(
                        where: { Id_transaccion: { _eq: $Id_transaccion } }
                        _set: { Id_estado: 4 }
                      ) {
                        returning {
                          Id_transaccion
                          Id_estado
                          descripcion_rechazo
                        }
                      }
                    }
                  `,
                  variables: {
                    Id_transaccion:
                      data.insert_BilleteraElectronica_Transaccion.returning[0]
                        .Id_transaccion,
                  },
                });
            } catch (error) {
              // se rechaza la transaccion
              const { data: updateEstadoTransacccion } = await client.mutate({
                mutation: gql`
                  mutation updateTransaccion($Id_transaccion: Int!) {
                    update_BilleteraElectronica_Transaccion(
                      where: { Id_transaccion: { _eq: $Id_transaccion } }
                      _set: {
                        Id_estado: 5
                        descripcion_rechazo: "Falla al crear credito"
                      }
                    ) {
                      returning {
                        Id_transaccion
                        Id_estado
                        descripcion_rechazo
                      }
                    }
                  }
                `,
                variables: {
                  Id_transaccion:
                    data.insert_BilleteraElectronica_Transaccion.returning[0]
                      .Id_transaccion,
                },
              });
    
              throw new Error(` No se pudo realizar la transaccion ${error}`);
            }


        return data.insert_BilleteraElectronica_Transaccion.returning[0];
      } catch (error) {
        throw new Error("Error al crear la transacción: " + error.message);
      }
    },
  },
};



module.exports = { resolvers };
