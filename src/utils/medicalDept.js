export function flattenHospitalDeptOptions(source) {
  const list = Array.isArray(source) ? source : []
  const hasTreeChildren = list.some(item => Array.isArray(item.children) && item.children.length)
  const roots = hasTreeChildren ? list : buildDeptTree(list)
  const options = []

  walkDeptTree(roots, [], options)
  return options
}

function buildDeptTree(list) {
  const map = {}
  const roots = []

  list.forEach(item => {
    map[String(item.deptId)] = Object.assign({}, item, { children: [] })
  })
  Object.keys(map).forEach(key => {
    const item = map[key]
    const parentId = item.parentId !== undefined && item.parentId !== null ? String(item.parentId) : '0'
    if (parentId !== '0' && map[parentId]) {
      map[parentId].children.push(item)
    } else {
      roots.push(item)
    }
  })
  return roots.length ? roots : Object.keys(map).map(key => map[key])
}

function walkDeptTree(nodes, parentNames, options) {
  ;(nodes || []).forEach(node => {
    const currentNames = parentNames.concat(node.deptName || '')
    const option = Object.assign({}, node, {
      deptOptionName: currentNames.filter(Boolean).join(' / ') || node.deptName
    })
    delete option.children
    options.push(option)

    if (node.children && node.children.length) {
      walkDeptTree(node.children, currentNames, options)
    }
  })
}
