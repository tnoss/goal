import { FiBarChart2 } from "react-icons/fi"
import dayjs from "dayjs"
import { PageContainer } from "../../components/PageContainer"
import { useEffect, useState } from "react"
import bookingService from "../../services/bookingService"
import { BookingPeriod, UserBooking } from "../../models/booking"
import { IoCheckmarkCircle, IoCheckmarkCircleOutline } from "react-icons/io5"

const BookingDashboard: React.FC = () => {
    const [userBookings, setUserBookings] = useState<UserBooking[]>([])
    const [dates, setDates] = useState<Date[]>([])
    const [nextPeriod, setNextPeriod] = useState<BookingPeriod>()

    useEffect(() => {
        handleNextPeriod()
    }, [])

    useEffect(() => {
        if (nextPeriod) {
            const days = Array.from(Array(7).keys()).map(d => dayjs(nextPeriod.from).add(d, 'day'))
            setDates(days.map(dd => dd.toDate()))
            loadBookings()
        }
    }, [nextPeriod])

    const handleNextPeriod = async () => {
        const period = await bookingService.getNextPeriod()
        setNextPeriod(period)
    }

    const loadBookings = async () => {
        if (nextPeriod) {
            const res = await bookingService.getAllBookings(nextPeriod.id)
            setUserBookings(res)
        }
    }

    return (
        <PageContainer icon={<FiBarChart2 size="26" />} title="Booking Dashboard">
            <div className="tw-flex tw-items-center tw-content-center tw-text-center tw-text-2xl tw-justify-center tw-mb-5">
                <h3>{dayjs(nextPeriod?.from).format('ddd DD MMM YYYY')} - {dayjs(nextPeriod?.to).format('ddd DD MMM YYYY')}</h3>
            </div>
            <table className='tw-w-full tw-table tw-border'>
                <thead>
                    <tr>
                        <th className="tw-bg-slate-100 tw-w-[200px]"></th>
                        {dates.map((d, i) => {
                            return (
                                <th key={i} className="tw-w-[130px] tw-h-10 tw-bg-slate-100 tw-justify-center tw-items-center">{dayjs(d).format('ddd')}</th>
                            )
                        })}
                    </tr>
                </thead>
                <tbody>
                    {userBookings.map((ub: UserBooking, idx: number) => {
                        return (
                            <tr className="tw-table-row hover:tw-bg-green-50 tw-border" key={idx}>
                                <td>
                                    <span className="tw-justify-start tw-px-5 tw-items-center tw-flex tw-font-bold">{ub.userDisplayName}</span>
                                </td>
                                {dates.map((date, i) => {
                                    const booking = ub.bookings.find(bd => dayjs(bd.bookingDate).date() == dayjs(date).date())
                                    return (
                                        <td key={i} className="tw-p-2">
                                            {booking ? (
                                                <span className="tw-text-emerald-500 tw-justify-center tw-items-center tw-flex">
                                                    <IoCheckmarkCircle size="30" />
                                                </span>
                                            ) : (
                                                <span className="tw-text-orange-200 tw-justify-center tw-items-center tw-flex">
                                                    <IoCheckmarkCircleOutline size="30" />
                                                </span>
                                            )}
                                        </td>
                                    )
                                })}
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </PageContainer>
    )
}

export default BookingDashboard