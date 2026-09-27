const MAX_ATTEMPTS = 5;

const nextCode = async (Model, field, prefix) => {
  const last = await Model.findOne({ [field]: { $regex: `^${prefix}\\d+$` } })
    .sort({ [field]: -1 })
    .select(field)
    .lean();
  const lastNumber = last ? parseInt(last[field].slice(prefix.length), 10) || 0 : 0;
  return `${prefix}${String(lastNumber + 1).padStart(4, "0")}`;
};

/**
 * Creates a document with a sequential, human-readable code (e.g. TRP-2026-0007).
 * Retries on duplicate-key races between concurrent requests.
 */
export async function createWithSequentialCode(Model, field, prefix, buildDoc) {
  for (let attempt = 1; ; attempt++) {
    const code = await nextCode(Model, field, prefix);
    try {
      return await Model.create(buildDoc(code));
    } catch (error) {
      const isCodeCollision = error.code === 11000 && error.keyPattern?.[field];
      if (!isCodeCollision || attempt >= MAX_ATTEMPTS) throw error;
    }
  }
}
