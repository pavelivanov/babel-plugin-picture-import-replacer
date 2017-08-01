export default function (babel) {

  const { types: t } = babel

  const getSizes = (comment) =>
    comment.replace('resolve picture', '').trim().replace(/x/g, '').split(' ')

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
  const declareSrcSizeAssignments = (sizes) =>
    sizes.map((size) => {
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

  /*
    if (src2x) srcSet += `, ${src2x}`
    if (src3x) srcSet += `, ${src3x}`
   */
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
                raw: ', ',
                cooked: ', ',
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

  /*
    return { src, srcSet }
   */
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
        const comments = path.node.leadingComments

        if (
          comments
          && Array.isArray(comments)
          && ~comments[comments.length - 1].value.indexOf('resolve picture')
        ) {
          const specifiers            = path.node.specifiers
          const imageName             = specifiers[0].local.name
          const imagePath             = path.node.source.value
          const sizes                 = getSizes(comments[comments.length - 1].value)
          const imagePathAssignment   = declareImageAssignment(imagePath)
          const srcSizeAssignments    = declareSrcSizeAssignments(sizes)

          path.replaceWith(t.variableDeclaration(
            'const',
            [
              t.variableDeclarator(
                t.identifier(imageName),
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
