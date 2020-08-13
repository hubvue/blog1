import React, { useState } from 'react'
import { graphql } from 'gatsby'

import Bio from '../components/Bio'
import Layout from '../components/Layout'
import SEO from '../components/Seo'
import ArticleList from '../components/ArticleList'
import CategoryList from '../components/CategoryList'
import '../../static/css/reset.css'

const BlogIndex = ({ data, location }) => {
  const siteTitle = data.site.siteMetadata.title
  const posts = data.allMarkdownRemark.edges
  const [articleList, setArticleList] = useState(posts)

  return (
    <Layout location={location} title={siteTitle}>
      <SEO title={siteTitle} />
      <Bio />
      <CategoryList update={setArticleList} posts={posts} />
      <ArticleList posts={articleList} />
    </Layout>
  )
}

export default BlogIndex

export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        title
      }
    }
    allMarkdownRemark(sort: { fields: [frontmatter___date], order: DESC }) {
      edges {
        node {
          excerpt
          fields {
            slug
          }
          frontmatter {
            date(formatString: "MMMM DD, YYYY")
            title
            description
            category
          }
        }
      }
    }
  }
`
