export default function (babel) {
  const { types: t } = babel;

  return {
    visitor: {

      ImportDeclaration(path) {
        const specifiers = path.node.specifiers

        if (specifiers) {
          if (
            specifiers[0].type === 'ImportDefaultSpecifier'
            && specifiers[0].local && specifiers[0].local.name === 'picture'
          ) {
            const imagePath = path.node.source.value
            const blockStatements = []

            const srcBlockStatement = t.variableDeclaration(
              'const',
              [
                t.variableDeclarator(
                  t.identifier('src'),
                  t.callExpression(
                    t.identifier('require'),
                    [
                      t.stringLiteral(imagePath)
                    ]
                  )
                )
              ]
            )

            for (let i = 1; i < specifiers.length; i++) {
              const specifier = specifiers[i]
              const size = specifier.local.name.replace('x', '')
              const templateName = `@${size}x$1`

              blockStatements.push(
                t.expressionStatement(
                  t.assignmentExpression(
                    '=',
                    t.identifier(`src${size}x`),
                    t.callExpression(
                      t.memberExpression(
                        t.identifier('src'),
                        t.identifier('replace'),
                      ),
                      [
                        t.newExpression(
                          t.identifier('RegExp'),
                          [
                            t.stringLiteral('(\.[a-z]+)$')
                          ]
                        ),
                        t.templateLiteral(
                          [
                            t.templateElement({
                              raw: templateName,
                              cooked: templateName
                            }, true),
                          ],
                          []
                        )
                      ]
                    )
                  )
                )
              )
            }

            const srcSetStatement = t.variableDeclaration(
              'const',
              [
                t.variableDeclarator(
                  t.identifier('srcSet'),
                  t.callExpression(
                    t.memberExpression(
                      t.templateLiteral(
                        [
                          t.templateElement({
                            raw: '',
                            cooked: '',
                          }, false),
                          t.templateElement({
                            raw: ' ',
                            cooked: ' ',
                          }, false),
                          t.templateElement({
                            raw: ' ',
                            cooked: ' ',
                          }, false),
                          t.templateElement({
                            raw: '',
                            cooked: '',
                          }, false),
                        ],
                        [
                          t.identifier('src'),
                          t.identifier('src2x'),
                          t.identifier('src3x'),
                        ]
                      ),
                      t.identifier('trim'),
                    ),
                    []
                  )
                )
              ]
            )

            path.replaceWith(t.variableDeclaration(
              'const',
              [
                t.variableDeclarator(
                  t.identifier('picture'),
                  t.callExpression(
                    t.arrowFunctionExpression(
                      [],
                      t.blockStatement([
                        t.variableDeclaration(
                          'let',
                          [
                            t.variableDeclarator(
                              t.identifier('src2x'),
                            )
                          ]
                        ),
                        t.variableDeclaration(
                          'let',
                          [
                            t.variableDeclarator(
                              t.identifier('src3x'),
                            )
                          ]
                        ),
                        srcBlockStatement,
                        ...blockStatements,
                        srcSetStatement,
                        t.returnStatement(
                          t.objectExpression(
                            [
                              t.objectProperty(
                                t.identifier('src'),
                                t.stringLiteral('src'),
                                false,
                                true,
                              ),
                              t.objectProperty(
                                t.identifier('srcSet'),
                                t.stringLiteral('srcSet'),
                                false,
                                true,
                              )
                            ]
                          )
                        )
                      ]),
                      false
                    ),
                    []
                  )
                )
              ]
            ))
          }
        }
      }
    }
  };
}
