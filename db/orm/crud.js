const knex = require('../connection')

const queryBuilders = (tableInfo) => {
  return {
    count: () => {
      return knex(tableInfo.name).count()
    },
    find: (id) => {
      return knex(tableInfo.name).select().where('id', id)
    },
    create: (params) => {
      return knex(tableInfo.name).insert(params, '*')
    },
    update: (id, params) => {
      return knex(tableInfo.name).where('id', id).update(params)
    },
    del: (id) => {
      return knex(tableInfo.name).where('id', id).del('*')
    }
  }
}

module.exports = (tableInfo) => {
  const transform = require('./transform')(tableInfo)
  const queries = queryBuilders(tableInfo)

  return {
    count: () => {
      return queries.count().then((result) => {
        return result[0].count
      })
    },
    find: (id) => {
      return queries.find(id).then((result) => {
        return transform.forObject(result[0])
      })
    },
    create: (params) => {
      return queries.create(transform.forRecord(params))
        .then((result) => {
          return transform.forObject(result[0])
        })
    },
    update: async (id, params) => {
      delete params.id

      await queries.update(id, transform.forRecord(params))
      const udpated = await queries.find(id)

      return transform.forObject(udpated[0])
    },
    del: (id) => {
      return queries.del(id)
        .then((result) => {
          return transform.forObject(result[0])
        })
    }
  }
}
