export default function (babel) {

  const { types: t } = babel

  const srcSizeVariables = [
    t.variableDeclaration(
      'let',
      [
        t.variableDeclarator(
          t.identifier('src2x'),
          t.stringLiteral(''),
        ),
      ]
    ),
    t.variableDeclaration(
      'let',
      [
        t.variableDeclarator(
          t.identifier('src3x'),
          t.stringLiteral(''),
        ),
      ]
    )
  ]

  const declareSrcAssignment = (imagePath) =>
    t.variableDeclaration('const', [
      t.variableDeclarator(
        t.identifier('src'),
        t.callExpression(
          t.identifier('require'),
          [
            t.stringLiteral(imagePath)
          ]
        )
      ),
    ])

  const declareSrcSizeAssignments = (specifiers) =>
    specifiers.slice(1).map((specifier) => {
      const size = specifier.local.name.replace('x', '')
      const tplElementValue = `@${size}x$1`

      return t.expressionStatement(
        t.assignmentExpression(
          '=',
          t.identifier(`src${size}x`),
          t.callExpression(
            t.identifier('require'),
            [
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
                        raw: tplElementValue,
                        cooked: tplElementValue,
                      }, true),
                    ],
                    []
                  )
                ]
              )
            ]
          )
        )
      )
    })

  const srcSetAssignment = t.variableDeclaration(
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

  const returnStatement = t.returnStatement(
    t.objectExpression(
      [
        t.objectProperty(
          t.identifier('src'),
          t.identifier('src'),
          false,
          true,
        ),
        t.objectProperty(
          t.identifier('srcSet'),
          t.identifier('srcSet'),
          false,
          true,
        )
      ]
    )
  )

  return {
    visitor: {

      ImportDeclaration(path) {
        const specifiers = path.node.specifiers

        if (
          specifiers
          && specifiers instanceof Array
          && specifiers.length
          && specifiers[0].type === 'ImportDefaultSpecifier'
          && specifiers[0].local && specifiers[0].local.name === 'picture'
        ) {
          const imagePath           = path.node.source.value
          const srcAssignment       = declareSrcAssignment(imagePath)
          const srcSizeAssignments  = declareSrcSizeAssignments(specifiers)

          path.replaceWith(t.variableDeclaration(
            'const',
            [
              t.variableDeclarator(
                t.identifier('picture'),
                t.callExpression(
                  t.arrowFunctionExpression(
                    [],
                    t.blockStatement([
                      ...srcSizeVariables,
                      srcAssignment,
                      ...srcSizeAssignments,
                      srcSetAssignment,
                      returnStatement,
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
}
