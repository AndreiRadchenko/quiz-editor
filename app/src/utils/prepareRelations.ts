export const prepareRelations = (
  relations: string[],
  role: string,
  serverIP: string | null
): string[] => {
  if (!serverIP) {
    return [];
  }
  if (role === 'editor' || role === 'general') {
    return relations.map(relation => {
      const [name, relationship] = relation.split('-');
      return `${relationship ? `${name.trim()} (${relationship})` : name.trim()}`;
    });
  }
  return [];
};
