export default function (babel) {

  const { types: t } = babel

  /*
    const imagePath = './images/icon.png';
   */
  const declareImageAssignment = (imagePath) =>
    t.variableDeclaration(
      'const',
      [
        t.variableDeclarator(
          t.identifier('imagePath'),
          t.stringLiteral(imagePath),
        ),
      ]
    )

  /*
    let src2x = '';
    let src3x = '';
    let srcSet = '';
   */
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
    ),
    t.variableDeclaration(
      'let',
      [
        t.variableDeclarator(
          t.identifier('srcSet'),
          t.stringLiteral(''),
        ),
      ]
    ),
  ]

  /*
    const src = require(imagePath);
   */
  const srcAssignment = t.variableDeclaration('const', [
    t.variableDeclarator(
      t.identifier('src'),
      t.callExpression(
        t.identifier('require'),
        [
          t.identifier('imagePath')
        ]
      )
    ),
  ])

  /*
    src2x = require(imagePath.replace(new RegExp("(.[a-z]+)$"), `@2x$1`));
    src3x = require(imagePath.replace(new RegExp("(.[a-z]+)$"), `@3x$1`));
   */
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
                  t.identifier('imagePath'),
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

  /*
    let srcSet = src;
   */
  const srcSetAssignment = t.expressionStatement(
    t.assignmentExpression(
      '=',
      t.identifier('srcSet'),
      t.identifier('src')
    )
  )

  // const srcSetAssignment = t.variableDeclaration(
  //   'let',
  //   [
  //     t.variableDeclarator(
  //       t.identifier('srcSet'),
  //       t.callExpression(
  //         t.memberExpression(
  //           t.templateLiteral(
  //             [
  //               t.templateElement({
  //                 raw: '',
  //                 cooked: '',
  //               }, false),
  //               t.templateElement({
  //                 raw: ' ',
  //                 cooked: ' ',
  //               }, false),
  //               t.templateElement({
  //                 raw: ' ',
  //                 cooked: ' ',
  //               }, false),
  //               t.templateElement({
  //                 raw: '',
  //                 cooked: '',
  //               }, false),
  //             ],
  //             [
  //               t.identifier('src'),
  //               t.identifier('src2x'),
  //               t.identifier('src3x'),
  //             ]
  //           ),
  //           t.identifier('trim'),
  //         ),
  //         []
  //       )
  //     )
  //   ]
  // )

  const ifStatements = [ 2,3 ].map((num) =>
    t.ifStatement(
      t.identifier(`src${num}x`),
      t.expressionStatement(
        t.assignmentExpression(
          '+=',
          t.identifier('srcSet'),
          t.templateLiteral(
            [
              t.templateElement({
                raw: ' ',
                cooked: ' ',
              }, false),
              t.templateElement({
                raw: '',
                cooked: '',
              }, true),
            ],
            [
              t.identifier(`src${num}x`),
            ]
          )
        )
      )
    )
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
          const imagePath             = path.node.source.value
          const imagePathAssignment   = declareImageAssignment(imagePath)
          const srcSizeAssignments    = declareSrcSizeAssignments(specifiers)

          path.replaceWith(t.variableDeclaration(
            'const',
            [
              t.variableDeclarator(
                t.identifier('picture'),
                t.callExpression(
                  t.arrowFunctionExpression(
                    [],
                    t.blockStatement([
                      imagePathAssignment,
                      ...srcSizeVariables,
                      srcAssignment,
                      ...srcSizeAssignments,
                      srcSetAssignment,
                      ...ifStatements,
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
