module.exports = (table, validations = {}, instanceBuilder = (inst => inst)) => {
  let instanceMethods = instance => instance

  const methods = {
    count: () => (table.count()),
    find: async (params) => {
      if (typeof params === 'number') {
        params = {id: params}
      }

      const res = await table.find(params)
      return res && methods.build(res)
    },
    where: async (params) => {
      const res = await table.where(params)
      return res && res.map((item) => (methods.build(item)))
    },
    build: (params) => {
      const instance = instanceMethods({})

      instance.params = params

      Object.keys(params).forEach((key) => {
        instance[key] = params[key]
      })

      return instance
    },
    create: async (params) => {
      const obj = methods.build(params)
      const errors = await obj.validationErrors()

      if (Object.keys(errors).length === 0) {
        params.createdAt = new Date()
        params.updatedAt = new Date()

        const res = await table.create(params)
        return methods.build(res)
      } else {
        return Promise.reject(errors)
      }
    },
    classDef: (name, method) => {
      methods[name] = method
    },
    findOrCreate: async (params) => {
      let res = await methods.find(params)

      if (!res) {
        res = await methods.create(params)
      }

      return res
    }
  }

  instanceMethods = (instance) => {
    instance.class = () => {
      return methods
    }

    instance.update = async (params) => {
      params.updatedAt = new Date()

      const res = await table.update(instance.id, params)
      return methods.build(res)
    }

    instance.save = async () => {
      if (instance.id) {
        return await instance.update(instance)
      } else {
        return await methods.create(instance)
      }
    }

    instance.del = async () => {
      const res = await table.del(instance.id)
      return methods.build(res)
    }

    instance.update = async (params) => {
      params.updatedAt = new Date()
      const res = await table.update(instance.id, params)
      return methods.build(res)
    }

    instance.validationErrors = async () => {
      const errors = {}

      await Promise.all(Object.keys(validations).map(field => {
        return Promise.all(validations[field].map(async (validation) => {
          const errMessage = await validation(instance)

          if (errMessage) {
            errors[field] = errors[field] || []
            errors[field].push(errMessage)
          }
        }))
      }))

      return errors
    }

    instance.prepare = () => {
      return instance.params
    }

    return instanceBuilder(instance)
  }

  return methods
}