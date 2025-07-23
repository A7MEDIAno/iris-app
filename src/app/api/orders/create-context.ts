export async function createOrderContext(request: Request) {
  const session = await requireAuth()
  
  const [company, user] = await Promise.all([
    prisma.company.findUnique({ where: { id: session.companyId } }),
    prisma.user.findUnique({ where: { id: session.userId } })
  ])
  
  if (!company || !user) {
    throw new AppError('Invalid session', 401)
  }
  
  return { company, user, session }
}