module.exports = {
    siteMetadata: {
        title: 'Theia - Cloud and Desktop IDE Platform',
        description: "Theia is an open-source cloud &nbsp; desktop IDE framework implemented in TypeScript."
    },
    plugins: [
        'gatsby-plugin-emotion',
        'gatsby-plugin-react-helmet',
        {
            resolve: 'gatsby-source-filesystem',
            options: {
                name: 'docs',
                path: `${__dirname}/src/docs`
            }
        },
        {
            resolve: `gatsby-source-filesystem`,
            options: {
              path: `${__dirname}/locales`,
              name: `locale`
            }
        },
        {
            resolve: `gatsby-transformer-remark`,
            options: {
                plugins: [
                    'gatsby-remark-autolink-headers',
                    "gatsby-remark-external-links",
                    "gatsby-remark-prismjs"
                ]
            }
        },
        {
            resolve: `gatsby-plugin-react-i18next`,
            options: {
              localeJsonSourceName: `locale`, // name given to `gatsby-source-filesystem` plugin.
              languages: [`en`, `zh`],
              defaultLanguage: `zh`,
              // if you are using Helmet, you must include siteUrl, and make sure you add http:https
              siteUrl: `https://theia-ide.org/`,
              // you can pass any i18next options
              i18nextOptions: {
                interpolation: {
                  escapeValue: false // not needed for react as it escapes by default
                },
                keySeparator: false,
                nsSeparator: false
              },
              pages: [
                {
                  matchPath: '/:lang?/blog/:uid',
                  getLanguageFromPath: true,
                  excludeLanguages: ['es']
                },
                {
                  matchPath: '/preview',
                  languages: ['en']
                }
              ]
            }
        }
    ]
}
