import paginate from "../../utils/paginate";

describe("paginate", () => {
  const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  test("returns correct slice for page 1", () => {
    const result = paginate(data, 1, 3);
    expect(result).toEqual([1, 2, 3]);
  });

  test("returns correct slice for page 2", () => {
    const result = paginate(data, 2, 3);
    expect(result).toEqual([4, 5, 6]);
  });

  test("returns correct slice for last page with fewer items", () => {
    const result = paginate(data, 4, 3);
    expect(result).toEqual([10]);
  });

  test("returns empty array if page exceeds data length", () => {
    const result = paginate(data, 5, 3);
    expect(result).toEqual([]);
  });

  test("handles empty data array", () => {
    const result = paginate([], 1, 3);
    expect(result).toEqual([]);
  });
});
