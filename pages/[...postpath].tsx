import React from 'react';
import Head from 'next/head';
import { GetServerSideProps } from 'next';
import { GraphQLClient, gql } from 'graphql-request';

// Define your GraphQL endpoint
const endpoint = "https://kashifyousaf.great-site.net/graphql";

// Function to check if the referral URL is from Facebook
const isFacebookReferral = (referer: string | undefined) => {
  return referer?.includes('facebook.com');
};

// Function to check if the request contains the 'fbclid' parameter
const hasFbclidParameter = (fbclid: any) => {
  return fbclid !== undefined;
};

// Main server-side function
export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const graphQLClient = new GraphQLClient(endpoint);
  const referringURL = ctx.req.headers?.referer || null;
  const pathArr = ctx.query.postpath as Array<string>;
  const path = pathArr.join('/');
  console.log(path);
  const fbclid = ctx.query.fbclid;

  // Check if Facebook is the referer or if the request contains 'fbclid'
  if (isFacebookReferral(referringURL) || hasFbclidParameter(fbclid)) {
    // Redirect to the specified destination
    return {
      redirect: {
        permanent: false,
        destination: `https://parzoom.com/vmvj9pdsr?key=aafc5688b250fc753247bef7c64a2a7a/`,
      },
    };
  }

  // Continue with regular processing if not a Facebook referral
  // ...

  // Return the necessary props
  return {
    props: {
      // Add any props you need to pass to the component
    },
  };
};

	const query = gql`
		{
			post(id: "/${path}/", idType: URI) {
				id
				excerpt
				title
				link
				dateGmt
				modifiedGmt
				content
				author {
					node {
						name
					}
				}
				featuredImage {
					node {
						sourceUrl
						altText
					}
				}
			}
		}
	`;

	const data = await graphQLClient.request(query);
	if (!data.post) {
		return {
			notFound: true,
		};
	}
	return {
		props: {
			path,
			post: data.post,
			host: ctx.req.headers.host,
		},
	};
};

interface PostProps {
	post: any;
	host: string;
	path: string;
}

const Post: React.FC<PostProps> = (props) => {
	const { post, host, path } = props;

	// to remove tags from excerpt
	const removeTags = (str: string) => {
		if (str === null || str === '') return '';
		else str = str.toString();
		return str.replace(/(<([^>]+)>)/gi, '').replace(/\[[^\]]*\]/, '');
	};

	return (
		<>
			<Head>
				<meta property="og:title" content={post.title} />
				<meta property="og:description" content={removeTags(post.excerpt)} />
				<meta property="og:type" content="article" />
				<meta property="og:locale" content="en_US" />
				<meta property="og:site_name" content={host.split('.')[0]} />
				<meta property="article:published_time" content={post.dateGmt} />
				<meta property="article:modified_time" content={post.modifiedGmt} />
				<meta property="og:image" content={post.featuredImage.node.sourceUrl} />
				<meta
					property="og:image:alt"
					content={post.featuredImage.node.altText || post.title}
				/>
				<title>{post.title}</title>
			</Head>
			<div className="post-container">
				<h1>{post.title}</h1>
				<img
					src={post.featuredImage.node.sourceUrl}
					alt={post.featuredImage.node.altText || post.title}
				/>
				<article dangerouslySetInnerHTML={{ __html: post.content }} />
			</div>
		</>
	);
};

export default Post;
