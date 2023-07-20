import { Model, ModelProps, Page, PartialModelObject, QueryBuilder } from 'objection'
import { isNumber } from 'lodash'

class CustomQueryBuilder<M extends Model, R = M[]> extends QueryBuilder<M, R> {
  // Workaround needed to extend the QB with TypeScript
  ArrayQueryBuilderType!: CustomQueryBuilder<M, M[]>
  SingleQueryBuilderType!: CustomQueryBuilder<M, M>
  NumberQueryBuilderType!: CustomQueryBuilder<M, number>
  PageQueryBuilderType!: CustomQueryBuilder<M, Page<M>>

  create(data: Pick<M, ModelProps<M>>) {
    return this.insert(data as PartialModelObject<M>)
  }

  paginate(page: any, size: any) {
    if (!isNumber(page) || !isNumber(size)) {
      throw new Error('Invalid `page` or `size` params on paginate()')
    }

    this.page(Number(page), Number(size))

    return this
  }
}

export class Base extends Model {
  QueryBuilderType!: CustomQueryBuilder<this>
  static QueryBuilder = CustomQueryBuilder

  createdAt?: any
  updatedAt?: any

  static get modelPaths() {
    return [__dirname]
  }

  static beforeInsert(args) {
    super.beforeInsert(args)

    const { inputItems } = args

    for (const item of inputItems) {
      item.createdAt = new Date()
    }
  }

  static beforeUpdate(args) {
    super.beforeUpdate(args)

    const { inputItems } = args

    for (const item of inputItems) {
      item.updatedAt = new Date()
    }
  }
}
