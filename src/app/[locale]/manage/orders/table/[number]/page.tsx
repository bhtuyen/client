import OrderTableDetail from '@/app/[locale]/manage/orders/table/[number]/order-table-detail';

export default function page({ params: { number } }: { params: { number: string } }) {
  return (
    // <Dialog>
    //   <DialogTrigger asChild>
    //     <TButton variant='outline'>Edit Profile</TButton>
    //   </DialogTrigger>
    //   <DialogContent className='w-full h-full max-w-full max-h-full flex flex-col gap-4'>
    //     <DialogHeader className='w-max-[1500px] w-[1500px] mx-auto h-fit'>
    //       <DialogTitle />
    //       <DialogDescription />
    //     </DialogHeader>
    //     <TablePayment />
    //     <DialogFooter className='w-max-[1500px] gap-4 w-[1500px] mx-auto flex flex-row items-center sm:justify-center justify-center'>
    //       <TButton variant='outline'>Hủy</TButton>
    //       <TButton>Xác nhận</TButton>
    //     </DialogFooter>
    //   </DialogContent>
    // </Dialog>
    <OrderTableDetail number={number} />
  );
}
