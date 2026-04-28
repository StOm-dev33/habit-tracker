export type User = {
  id: string; // UUID, unique
  email: string; // Unique
  password: string;
  createdAt: string; // ISO timestamp
};

export type Session = {
  userId: string; // References User.id
  email: string;
};
