'use client';
import Todo from '@/app/components/Todo/Todo';
import { useParams } from 'next/navigation';

const page = () => {
  const params = useParams();
  return <Todo _id={params._id} />;
};

export default page;
