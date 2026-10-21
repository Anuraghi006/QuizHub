import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Alert, Button, Card, Label, Pagination, Select, Textarea, TextInput } from 'flowbite-react'
import {
    fetchCategories,
    fetchQuestions,
    addQuestion,
    updateQuestion,
    deleteQuestion,
} from '../redux/slices/questionSlice'

const PER_PAGE = 5
const emptyForm = { question: '', category: '', difficulty: 'easy', options: ['', '', '', ''], correctIndex: 0 }

function AdminQuestions() {
    const dispatch = useDispatch()
    const categories = useSelector((state) => state.questionReducer.categories)
    const questions = useSelector((state) => state.questionReducer.questions)

    const [form, setForm] = useState(emptyForm)
    const [editingId, setEditingId] = useState(null)
    const [openId, setOpenId] = useState(null) // which question is open in "View"
    const [message, setMessage] = useState('')

    const [search, setSearch] = useState('')
    const [categoryFilter, setCategoryFilter] = useState('')
    const [difficultyFilter, setDifficultyFilter] = useState('')
    const [page, setPage] = useState(1)

    useEffect(() => {
        dispatch(fetchCategories())
        dispatch(fetchQuestions())
    }, [dispatch])

    // Filter and split into pages in the browser
    const filtered = questions.filter((q) =>
        q.question.toLowerCase().includes(search.toLowerCase()) &&
        (categoryFilter === '' || q.category === categoryFilter) &&
        (difficultyFilter === '' || q.difficulty === difficultyFilter)
    )
    const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
    const currentPage = Math.min(page, totalPages)
    const shown = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE)

    // Going back to page 1 whenever a filter changes
    const changeFilter = (setter) => (e) => {
        setter(e.target.value)
        setPage(1)
    }

    const changeOption = (index, value) => {
        const options = [...form.options]
        options[index] = value
        setForm({ ...form, options })
    }

    const startEdit = (q) => {
        setEditingId(q.id)
        setForm({ question: q.question, category: q.category, difficulty: q.difficulty, options: q.options, correctIndex: q.correctIndex })
        setMessage('')
    }

    const handleSave = async (e) => {
        e.preventDefault()
        try {
            if (editingId) {
                await dispatch(updateQuestion({ id: editingId, formData: form })).unwrap()
                setMessage('Question updated')
            } else {
                await dispatch(addQuestion(form)).unwrap()
                setMessage('Question added')
            }
            setEditingId(null)
            setForm(emptyForm)
        } catch (error) {
            setMessage(error)
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this question?')) return
        try {
            await dispatch(deleteQuestion(id)).unwrap()
            setMessage('Question deleted')
        } catch (error) {
            setMessage(error)
        }
    }

    return (
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-6">
            <h1 className="text-2xl font-bold text-gray-900">Manage questions</h1>
            {message && <Alert color="info">{message}</Alert>}

            {/* Form: add or edit */}
            <Card className="bg-white border border-gray-200 shadow-sm dark:bg-white">
                <h2 className="text-xl font-semibold text-gray-900">{editingId ? 'Edit question' : 'Add a question'}</h2>
                <form onSubmit={handleSave} className="flex flex-col gap-4">
                    <div>
                        <Label htmlFor="q-text" value="Question" className="text-gray-700 font-medium" />
                        <Textarea 
                            id="q-text" 
                            rows={2} 
                            required 
                            placeholder="Enter the question prompt here..."
                            value={form.question}
                            onChange={(e) => setForm({ ...form, question: e.target.value })} 
                        />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <Label htmlFor="q-category" value="Category" className="text-gray-700 font-medium" />
                            <TextInput 
                                id="q-category" 
                                list="category-list" 
                                required 
                                placeholder="e.g. Science, History, Tech..."
                                value={form.category}
                                onChange={(e) => setForm({ ...form, category: e.target.value })} 
                            />
                            <datalist id="category-list">
                                {categories.map((c) => <option key={c} value={c} />)}
                            </datalist>
                        </div>
                        <div>
                            <Label htmlFor="q-difficulty" value="Difficulty" className="text-gray-700 font-medium" />
                            <Select 
                                id="q-difficulty" 
                                value={form.difficulty}
                                onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
                            >
                                <option value="easy">Easy</option>
                                <option value="medium">Medium</option>
                                <option value="hard">Hard</option>
                            </Select>
                        </div>
                    </div>
                    {form.options.map((option, index) => (
                        <div key={index}>
                            <Label htmlFor={`option-${index}`} value={`Option ${String.fromCharCode(65 + index)}`} className="text-gray-700 font-medium" />
                            <TextInput 
                                id={`option-${index}`} 
                                required 
                                placeholder={`Enter option ${String.fromCharCode(65 + index)}...`}
                                value={option}
                                onChange={(e) => changeOption(index, e.target.value)} 
                            />
                        </div>
                    ))}
                    <div>
                        <Label htmlFor="q-correct" value="Correct option" className="text-gray-700 font-medium" />
                        <Select 
                            id="q-correct" 
                            value={form.correctIndex}
                            onChange={(e) => setForm({ ...form, correctIndex: Number(e.target.value) })}
                        >
                            {form.options.map((_, index) => (
                                <option key={index} value={index}>Option {String.fromCharCode(65 + index)}</option>
                            ))}
                        </Select>
                    </div>
                    <div className="flex gap-3">
                        <Button type="submit" className="bg-purple-700 hover:bg-purple-800 text-white">
                            {editingId ? 'Save changes' : 'Add question'}
                        </Button>
                        {editingId && (
                            <Button color="light" onClick={() => { setEditingId(null); setForm(emptyForm) }}>Cancel</Button>
                        )}
                    </div>
                </form>
            </Card>

            {/* Search and filters */}
            <Card className="bg-white border border-gray-200 shadow-sm dark:bg-white">
                <div className="grid gap-3 md:grid-cols-3">
                    <TextInput 
                        placeholder="Search question text..." 
                        value={search} 
                        onChange={changeFilter(setSearch)} 
                    />
                    <Select value={categoryFilter} onChange={changeFilter(setCategoryFilter)}>
                        <option value="">All categories</option>
                        {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                    </Select>
                    <Select value={difficultyFilter} onChange={changeFilter(setDifficultyFilter)}>
                        <option value="">All difficulties</option>
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                    </Select>
                </div>
            </Card>

            {/* List */}
            <p className="text-sm text-gray-500">{filtered.length} question(s) found</p>
            {shown.length === 0 && <p className="text-gray-500">No questions match.</p>}
            {shown.map((q) => (
                <Card key={q.id} className="bg-white border border-gray-200 shadow-sm dark:bg-white">
                    <p className="font-medium text-gray-900">{q.question}</p>
                    <p className="text-xs text-gray-500">{q.category} · {q.difficulty}</p>
                    {openId === q.id && (
                        <ol className="mt-2 flex flex-col gap-1 text-sm">
                            {q.options.map((option, index) => (
                                <li key={index} className={index === q.correctIndex ? 'font-semibold text-green-700' : 'text-gray-800'}>
                                    {String.fromCharCode(65 + index)}. {option} {index === q.correctIndex && '(correct)'}
                                </li>
                            ))}
                        </ol>
                    )}
                    <div className="mt-3 flex gap-2">
                        <Button size="xs" color="light" onClick={() => setOpenId(openId === q.id ? null : q.id)}>
                            {openId === q.id ? 'Hide' : 'View'}
                        </Button>
                        <Button size="xs" color="blue" onClick={() => startEdit(q)}>Edit</Button>
                        <Button size="xs" color="failure" onClick={() => handleDelete(q.id)}>Delete</Button>
                    </div>
                </Card>
            ))}

            {totalPages > 1 && (
                <div className="flex justify-center">
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setPage} showIcons />
                </div>
            )}
        </div>
    )
}

export default AdminQuestions