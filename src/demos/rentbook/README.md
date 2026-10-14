# Rentbook

Rentbook is a light-first rent-management console for a five-property Lagos portfolio. Its visual language is cool paper, hairline ledger rules, deep emerald actions, and restrained receipt/stamp details; Hanken Grotesk carries the interface and Spline Sans Mono carries money, dates, IDs and tables.

The client provider seeds deterministic portfolio data only after mount, validates its schema version before persistence, and reseeds corrupted or stale storage. Financial status is derived from charges and allocations. The overview filters all figures, payment history and the twelve-month income/expense chart by the chosen property. Payment recording allocates to the oldest outstanding charge first with integer kobo arithmetic, and an overpayment needs an explicit credit choice.
