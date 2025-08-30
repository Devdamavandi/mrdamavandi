

/**
 * This is Just a Test Api file.
 * I use it sometimes when I need any changes in my Database.
 */



// export async function GET(){
//    const categories = await prisma.category.findMany({
//     select: {
//       id: true,
//       slug: true,
//    },
// })

//    const updatedCategories = await prisma.$transaction(
//       categories.map(({id, slug}: {id: string; slug: string}) => {
//          const cleanedSlug = slug
//             .replace(/[^a-zA-Z]/g, ' ')
//             .replace(/\s+/g, '-')
//             .toLowerCase();

//          return prisma.category.update({
//             where: {id},
//             data: {slug: cleanedSlug}
//          })
//       })
//    )
   
//    return NextResponse.json({ success: true, updated: updatedCategories.length})
// }

