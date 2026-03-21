import pool from '../db/pool.js'

const targets = [
  { table: 'team_members', id: 'id', column: 'photo_url' },
  { table: 'branches', id: 'id', column: 'photo_url' },
  { table: 'gallery_items', id: 'id', column: 'image_url' },
  { table: 'highlights', id: 'id', column: 'image_url' },
  { table: 'products', id: 'id', column: 'image_url' },
]

async function findFragileUrls(table, idColumn, urlColumn) {
  const query = `
    SELECT ${idColumn} AS id, ${urlColumn} AS url
    FROM ${table}
    WHERE ${urlColumn} IS NOT NULL
      AND btrim(${urlColumn}) <> ''
      AND (
        ${urlColumn} LIKE '/uploads/%'
        OR ${urlColumn} !~* '^https?://'
      )
    ORDER BY ${idColumn} ASC
  `
  const result = await pool.query(query)
  return result.rows
}

async function main() {
  const output = []
  let total = 0

  for (const target of targets) {
    const rows = await findFragileUrls(target.table, target.id, target.column)
    total += rows.length
    output.push({
      table: target.table,
      column: target.column,
      count: rows.length,
      rows,
    })
  }

  console.log(`Fragile image URL audit complete. Affected records: ${total}`)
  console.log(JSON.stringify(output, null, 2))
}

main()
  .catch((error) => {
    console.error('Failed to audit image URLs:', error.message || error)
    process.exitCode = 1
  })
  .finally(async () => {
    await pool.end()
  })
