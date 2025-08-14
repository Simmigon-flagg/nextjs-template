export default function paginate(data, currentPage, itemsPerPage) {
  const startIndex = (currentPage - 1) * itemsPerPage;
  return data.slice(startIndex, startIndex + itemsPerPage);
}
