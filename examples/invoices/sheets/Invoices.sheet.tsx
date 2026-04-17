import { defineSheet, Sheet, Column, Formula } from 'nextsheet'

export default defineSheet('Invoices 2026', () => (
  <Sheet>
    <Column name="id"     type="number"   primary />
    <Column name="client" type="string"   required />
    <Column name="amount" type="currency" currency="USD" />
    <Column name="paid"   type="boolean"  default={false} />
    <Column
      name="total"
      type="currency"
      formula={({ amount }) => <Formula>{amount} * 1.21</Formula>}
    />
  </Sheet>
))
