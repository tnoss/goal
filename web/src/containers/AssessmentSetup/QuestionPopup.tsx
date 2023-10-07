import { FC, useMemo, useState } from "react"
import { Popup } from "../../components/Popup"
import { Box, FormControl, FormControlLabel, FormGroup, FormLabel, IconButton, Radio, RadioGroup, Tab, Tabs, TextareaAutosize } from "@mui/material"
import { TabContent } from "../../components/TabContent"
import { DataGrid, GridColDef } from "@mui/x-data-grid"
import { QuestionModel, QuestionType } from "../HSE/models/QuestionModel"
import { v4 as newId } from 'uuid'
import { IoSettings, IoTrash } from "react-icons/io5"
import { FiPlusSquare } from "react-icons/fi"

interface Props {
    versionId: number
    isOpen: boolean
    onClose: () => void
    onSubmit: (question: QuestionModel) => void
}

export const QuestionPopup: FC<Props> = ({
    versionId,
    isOpen,
    onClose,
    onSubmit,
}) => {

    const initQuestion = {
        description: '',
        type: QuestionType.FreeText,
        choices: [],
        assessmentVersionId: versionId
    }

    const [tabIndex, setTabIndex] = useState(0)
    const [question, setQuestion] = useState<QuestionModel>(initQuestion)
    const [tabAnswerEnable, setTabAnswerEnable] = useState(false)
    const isChoiceQuestion = useMemo(() => {
        return (+question.type === QuestionType.SingleChoice || +question.type === QuestionType.MultipleChoice)
    }, [question.type])
    const [choiceText, setChoiceText] = useState('')
    const [openChoicePopup, setOpenChoicePopup] = useState(false)

    const choiceColDefs: GridColDef[] = [
        { field: 'description', headerName: 'Description', width: 400 },
        {
            field: 'id',
            headerName: '',
            sortable: false,
            filterable: false,
            valueGetter: () => newId(),
            renderCell: (e) => {
                return (
                    <IconButton onClick={() => removeChoice(e.value)}>
                        <IoTrash className="tw-text-red-500" />
                    </IconButton>
                )
            }
        }
    ]

    function addChoice() {
        setQuestion({
            ...question,
            choices: [
                ...question!.choices!,
                { description: choiceText }
            ]
        })
        setChoiceText('')
        setOpenChoicePopup(false)
    }

    function removeChoice(uid: string) {
        setQuestion({
            ...question,
            choices: question.choices?.filter(c => c.uid !== uid)
        })
    }

    function showChoicePopup() {
        setOpenChoicePopup(true)
    }

    function onQuestionTypeChange(e: any, value: string) {
        const id = +value

        const isAnswerEnabled = [
            QuestionType.YesNo,
            QuestionType.YesNoNA,
            QuestionType.SingleChoice,
            QuestionType.MultipleChoice,
            QuestionType.Confirmation
        ].includes(id)

        setQuestion({ ...question, type: id })
        setTabAnswerEnable(isAnswerEnabled)
    }

    function onTabChange(_: any, tabIndex: number) {
        setTabIndex(tabIndex)
    }

    function handleSubmit() {
        onSubmit && onSubmit(question)
    }

    return (
        <>
            <Popup
                icon={<IoSettings />}
                isOpen={isOpen}
                submitLabel="Save"
                title="Question Details"
                onCloseClicked={onClose}
                onSubmitClicked={handleSubmit}
            >
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={tabIndex} onChange={onTabChange} aria-label="Question Answer Setup Tabs">
                        <Tab label="Question Setup" />
                        <Tab disabled={!tabAnswerEnable} label="Answer Setup" />
                    </Tabs>
                </Box>
                <TabContent value={tabIndex} index={0}>
                    <div className="tw-flex tw-flex-col tw-gap-3">
                        <FormGroup>
                            <FormLabel id="question-label" sx={{ fontWeight: 'bold' }}>Question</FormLabel>
                            <TextareaAutosize
                                aria-labelledby="question-label"
                                value={question.description}
                                required={true}
                                maxRows={10}
                                minRows={8}
                                onChange={(e) => setQuestion({ ...question, description: e.target.value })} />
                        </FormGroup>
                        <FormControl>
                            <FormLabel sx={{ fontWeight: 'bold' }} id="question-type-label">Question Type</FormLabel>
                            <RadioGroup
                                row
                                aria-labelledby="question-type-label"
                                defaultValue={0}
                                value={question.type}
                                name="radio-buttons-group"
                                onChange={onQuestionTypeChange}
                            >
                                <FormControlLabel value={0} control={<Radio />} label="Text" />
                                <FormControlLabel value={1} control={<Radio />} label="Yes No" />
                                <FormControlLabel value={2} control={<Radio />} label="Yes No N/A" />
                                <FormControlLabel value={3} control={<Radio />} label="Confirmation" />
                                <FormControlLabel value={4} control={<Radio />} label="Photo" />
                                <FormControlLabel value={5} control={<Radio />} label="Single Choice" />
                                <FormControlLabel value={6} control={<Radio />} label="Multiple Choice" />
                            </RadioGroup>
                        </FormControl>
                    </div>
                </TabContent >
                <TabContent value={tabIndex} index={1}>
                    <Box sx={{
                        height: 400,
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'start',
                        gap: 1
                    }}>
                        {isChoiceQuestion && (
                            <>
                                <button onClick={showChoicePopup} className="btn-secondary"><FiPlusSquare /> Add Choice</button>
                                <DataGrid
                                    sx={{ width: '100%' }}
                                    getRowId={() => newId()}
                                    rows={question.choices!}
                                    columns={choiceColDefs}
                                    initialState={{
                                        pagination: {
                                            paginationModel: {
                                                pageSize: 5,
                                            },
                                        },
                                    }}
                                    pageSizeOptions={[5]}
                                    checkboxSelection
                                    disableRowSelectionOnClick />
                            </>
                        )}
                        {question.type === QuestionType.YesNo && (
                            <div>
                                <div>Yes</div>
                                <div>No</div>
                            </div>
                        )}
                        {question.type === QuestionType.YesNoNA && (
                            <div>
                                <div>Yes</div>
                                <div>No</div>
                                <div>N/A</div>
                            </div>
                        )}
                        {question.type === QuestionType.Confirmation && (
                            <div>
                                <div>Confirm</div>
                                <div>Unconfirmed</div>
                            </div>
                        )}
                    </Box>
                </TabContent>
            </Popup>
            <Popup
                size="xs"
                isOpen={openChoicePopup}
                submitLabel="Add"
                title="Choice Setup"
                onCloseClicked={() => setOpenChoicePopup(false)}
                onSubmitClicked={addChoice}
            >
                <FormGroup>
                    <FormLabel>Description</FormLabel>
                    <textarea value={choiceText} rows={5} onChange={e => setChoiceText(e.target.value)} />
                </FormGroup>
            </Popup>
        </>
    )
}