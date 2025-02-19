import React, {PureComponent} from 'react'

import DatabaseListItem from 'src/flux/components/DatabaseListItem'

import {ErrorHandling} from 'src/shared/decorators/errors'
import {Source, NotificationAction, TimeRange} from 'src/types'
import {executeQuery} from 'src/shared/apis/flux/query'
import {parseResponse} from 'src/shared/parsing/flux/response'
import {isEqual} from 'lodash'

interface Props {
  source: Source
  timeRange: TimeRange
  notify: NotificationAction
}

export async function getBuckets(source: Source): Promise<string[]> {
  const {csv} = await executeQuery(source, 'buckets()')
  const tables = parseResponse(csv)
  if (tables && tables.length > 0) {
    const data = tables[0].data
    if (data.length > 1) {
      const nameIndex = data[0].indexOf('name')
      if (nameIndex > 0) {
        const buckets = data.slice(1).map(arr => arr[nameIndex] as string)
        return buckets.sort()
      }
    }
  }
  return []
}

interface State {
  databases: string[]
}

@ErrorHandling
class DatabaseList extends PureComponent<Props, State> {
  constructor(props) {
    super(props)

    this.state = {
      databases: [],
    }
  }

  public componentDidMount() {
    this.getDatabases()
  }

  public componentDidUpdate({source: prevSource}: Props) {
    const {source: nextSource} = this.props
    const differentSource = !isEqual(prevSource, nextSource)

    if (differentSource) {
      this.setState({
        databases: [],
      })
      this.getDatabases()
    }
  }

  public async getDatabases() {
    const {source} = this.props
    try {
      const buckets = await getBuckets(source)
      this.setState({databases: buckets})
    } catch (err) {
      console.error(err)
    }
  }

  public render() {
    const {databases} = this.state
    const {source, timeRange, notify} = this.props

    return databases.map(db => {
      return (
        <DatabaseListItem
          db={db}
          key={db}
          source={source}
          timeRange={timeRange}
          notify={notify}
        />
      )
    })
  }
}

export default DatabaseList
