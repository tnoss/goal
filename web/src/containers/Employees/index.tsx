import { useEffect, useState } from 'react'
import { FiPlus, FiUpload, FiUserPlus, FiUsers } from 'react-icons/fi'
import { PageContainer } from '../../components/PageContainer'
import { HContainer } from '../../components/HContainer'
import { EmployeeGrid } from './EmployeeGrid'
import useBearStore from '../../store'
import employeeService from '../../services/employeeService'
import { Popup } from '../../components/Popup'
import { FileUploader } from '../../components/FileUploader'
import { enqueueSnackbar } from 'notistack'

const Employees = () => {
	const store = useBearStore()
	const [loading, setLoading] = useState(false)
	const [show, setShow] = useState(false)

	useEffect(() => {
		load()
	}, [])

	const load = async () => {
		setLoading(true)
		const employees = await employeeService.getAll()
		store.loadEmployees(employees)
		setLoading(false)
	}

	const handleUpload = async (files: File[]) => {
		try {
			await employeeService.upload(files[0])
			enqueueSnackbar('Import successfully', { variant: 'success' })
		} catch (e: any) {
			console.log(e)
			enqueueSnackbar('Failed to import employee', { variant: 'error' })
		}
		await load()
		setShow(false)
	}

	return (
		<PageContainer
			title='Employee Management'
			icon={<FiUsers />}
			action={
				<HContainer>
					<button
						className='btn-secondary'
						onClick={() => setShow(true)}>
						<FiUpload /> Import
					</button>

					<button className='btn-primary'>
						<FiPlus /> Create
					</button>
				</HContainer>
			}>
			<EmployeeGrid loading={loading} reload={load} />

			<Popup
				show={show}
				submitLabel='Import'
				submitIcon={<FiUpload />}
				size='sm'
				icon={<FiUserPlus />}
				title='Import Employees'
				onCloseClicked={() => setShow(false)}
				showFooter={false}>
				<FileUploader
					extensions={['text/csv']}
					onUpload={handleUpload}
				/>
			</Popup>
		</PageContainer>
	)
}

export default Employees
