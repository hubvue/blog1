import React from 'react'
import { rhythm } from '../utils/typography'
import { Link } from 'gatsby'

const ArticleList = ({ posts }) => {
  // 文章列表
  const articleList = posts.map(({ node }) => {
    const title = node.frontmatter.title || node.fields.slug
    return (
      <div key={node.fields.slug}>
        <h3
          style={{
            marginBottom: rhythm(1 / 4),
            fontSize: `20px`
          }}
        >
          <Link
            style={{ boxShadow: `none`, color: `rgb(211,54,105)` }}
            to={node.fields.slug}
          >
            {title}
          </Link>
        </h3>
        <small>{node.frontmatter.date}</small>
        <p
          dangerouslySetInnerHTML={{
            __html: node.frontmatter.description || node.excerpt
          }}
        />
      </div>
    )
  })
  return articleList
}

export default ArticleList
