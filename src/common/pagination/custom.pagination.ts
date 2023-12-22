

export function customPagination(
    items,
    pageActual,
    limitItems,
    filter: any,
) {
    const { page, limit } = filter;
    let result = [];
    let totalPage = Math.ceil(items.length / limitItems);
    let count = pageActual * limitItems - limitItems;
    let delimiter = count + limitItems;
    if (pageActual <= totalPage) {
        for (let i = count; i < delimiter; i++) {
            if (items[i] != null) {
                result.push(items[i]);
            }
            count++;
        }
    }
    if (items.length === 0) {
        return {
            message: 'Sem Dados Cadastrados',
            items: result,
            meta: {
                totalItems: items.length,
                itemCount: result.length,
                itemsPerPage: Number(limit),
                totalPages: totalPage,
                currentPage: Number(page),
            },
        };
    } else
        return {
            items: result,
            meta: {
                totalItems: items.length,
                itemCount: result.length,
                itemsPerPage: Number(limit),
                totalPages: totalPage,
                currentPage: Number(page),
            },
        };
}


