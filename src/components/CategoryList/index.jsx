import React from 'react'
import Style from './index.css'
const CategoryList = ({ update, posts }) => {
  const updateCategory = category => () => {
    const list = posts.filter(
      item => item.node.frontmatter.category === category
    )
    update(list)
  }
  let listMap = new Map()
  posts.forEach(({ node }) => {
    const category = node.frontmatter.category || 'other'
    if (listMap.has(category)) {
      listMap.set(category, listMap.get(category) + 1)
    } else {
      listMap.set(category, 1)
    }
  })
  let list = []
  for (let [cate, count] of listMap) {
    list.push(
      <li class="category-item">
        <span key={cate} onClick={updateCategory(cate)}>
          {cate}
        </span>
        <span class="category-item_count">({count})</span>
      </li>
    )
  }

  return <ul class="category-wrap">{list}</ul>
}

export default CategoryList
