import { EntryType, Prisma } from '@prisma/client';
import { prisma } from '../prisma';

const defaultCategorySeed: { name: string; type: EntryType; children?: string[] }[] = [
  { name: '餐饮', type: 'expense', children: ['早餐', '午餐', '晚餐', '饮料'] },
  { name: '交通', type: 'expense', children: ['公交', '地铁', '出租', '打车'] },
  { name: '居家', type: 'expense', children: ['房租', '水电', '家居用品'] },
  { name: '购物', type: 'expense', children: ['食品杂货', '服饰', '数码'] },
  { name: '收入', type: 'income', children: ['工资', '奖金', '投资'] }
];

export const createDefaultCategories = async (ledgerId: string) => {
  const existing = await prisma.category.findFirst({ where: { ledgerId } });
  if (existing) return;

  const actions: Prisma.PrismaPromise<any>[] = [];
  for (const cat of defaultCategorySeed) {
    actions.push(
      prisma.category.create({
        data: {
          name: cat.name,
          type: cat.type,
          ledgerId,
          children: {
            create: (cat.children || []).map((child) => ({
              name: child,
              type: cat.type,
              ledgerId
            }))
          }
        }
      })
    );
  }
  await prisma.$transaction(actions);
};
