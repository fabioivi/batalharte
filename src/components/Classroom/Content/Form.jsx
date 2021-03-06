import React from 'react';
import PropTypes from 'prop-types';
import compose from 'recompose/compose';
// Router
import { Link } from 'react-router-dom';
// Firebase
import { database } from '../../../firebase';
// Redux
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
// Actions
import { doListClassroom } from '../../../redux/actions/classroomActions';
// RichTextEditor
import RichTextEditor from 'react-rte';
// Material-ui
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import InputLabel from '@material-ui/core/InputLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';
import Snackbar from '@material-ui/core/Snackbar';
import CircularProgress from '@material-ui/core/CircularProgress';
// styles
import styles from './styles';
// Operator
import If from '../../Operator/If';

const INITIAL_STATE = {
    isLoading: false,
    openSnackbarSuccess: false,
    openSnackbarAlert: false,
    title: '',
    description: '',
    content: RichTextEditor.createEmptyValue(),
    source: '',
    competence: '',
    discipline: '',
    isPublic: 1, // Número 1 = Público/True | Número 0 = Privado/False
};

class Form extends React.Component {
    constructor(props) {
        super(props);
        this.state = { ...INITIAL_STATE };
    };

    handleChange = name => event => {
        this.setState({
            [name]: event.target.value,
        });
    };

    onChange = (value) => {
        this.setState({ content: value });
        if (this.props.onChange) {
            this.props.onChange(
                value.toString('html')
            );
        }
    };

    handleChangeSelect = event => {
        this.setState({ [event.target.name]: event.target.value });
    };

    handleClose = (snackbar) => {
        this.setState({ [snackbar]: false });
    };

    // Função executada após a submissão do formulário.
    onSubmit = (event) => {
        event.preventDefault();

        // Props
        const { user, classroom } = this.props;

        if (user !== null && classroom !== null) {
            this.doRegisterContent();
        } else {
            this.setState({ openSnackbarAlert: true });
        }
    };

    // Função responsável por registrar o conteúdo.
    doRegisterContent = () => {
        // Content Object
        const content = this.getContentObject();
        // Classroom
        const { classroom } = this.props;

        // Loading true
        this.setState({ isLoading: true });

        database.doRegisterContent(content)
            .then((content) => {
                database.doRegisterContentInClassroom(content.key, classroom.uid)
                    .then(() => {
                        this.setState({ ...INITIAL_STATE });
                        this.updateClassroom();
                    })
            })
    };

    updateClassroom = () => {
        // Props
        const {
            classroom,
        } = this.props;

        // Get uid classroom
        const {
            uid,
        } = classroom;

        database.doGetClassRoom(uid)
            .then(classroomUpdate => {
                const clssrm = classroomUpdate.val();
                clssrm.uid = classroomUpdate.key;
                this.props.doListClassroom(clssrm);
                // Message
                this.setState({ openSnackbarSuccess: true });
            })
    };

    // Função responsável por retornar o objeto conteúdo.
    getContentObject = () => {
        // Props
        const { user } = this.props;

        // Uid
        const { uid } = user;

        // State
        const {
            title,
            description,
            content,
            source,
            competence,
            discipline,
        } = this.state;

        //GetValueIsPublic
        const isPublic = this.getValue();

        const contentObject = {
            author: uid,
            title,
            description,
            content: content.toString('html'),
            source,
            competence,
            discipline,
            isPublic,
        };

        return contentObject;
    };

    // Função responsável por converter a propriedade "isPublic" de number para bollean (true ou false).
    getValue = () => {
        // State
        const { isPublic } = this.state;

        return !!isPublic;
    };

    render() {
        // State
        const {
            isLoading,
            openSnackbarSuccess,
            openSnackbarAlert,
            title,
            description,
            content,
            source,
            competence,
            discipline,
            isPublic,
        } = this.state;

        // Props
        const {
            classes,
            classroom,
        } = this.props;

        // Configuration Form
        const toolbarConfig = {
            // Optionally specify the groups to display (displayed in the order listed).
            display: ['INLINE_STYLE_BUTTONS', 'BLOCK_TYPE_BUTTONS', 'LINK_BUTTONS', 'BLOCK_TYPE_DROPDOWN', 'HISTORY_BUTTONS'],
            INLINE_STYLE_BUTTONS: [
                { label: 'Negrito', style: 'BOLD', className: 'custom-css-class' },
                { label: 'Itálico', style: 'ITALIC' },
                { label: 'Sublinhado', style: 'UNDERLINE' }
            ],
            BLOCK_TYPE_DROPDOWN: [
                { label: 'Texto Normal', style: 'unstyled' },
                { label: 'Título Grande', style: 'header-one' },
                { label: 'Título Médio', style: 'header-two' },
                { label: 'Título Pequeno', style: 'header-three' }
            ],
            BLOCK_TYPE_BUTTONS: [
                { label: 'UL', style: 'unordered-list-item' },
                { label: 'OL', style: 'ordered-list-item' }
            ]
        };

        return (
            <div>
                <Paper className={classes.root} elevation={1}>
                    <Typography align="center" variant="title" className={classes.title}>
                        CADASTRAR CONTEÚDO
                    </Typography>
                    <form onSubmit={this.onSubmit}>
                        <TextField
                            value={title}
                            onChange={this.handleChange('title')}
                            id="title"
                            label="Título"
                            margin="normal"
                            type="text"
                            fullWidth
                            required
                        />
                        <TextField
                            value={description}
                            onChange={this.handleChange('description')}
                            id="description"
                            label="Descrição"
                            margin="normal"
                            multiline
                            rowsMax="5"
                            fullWidth
                            required
                        />
                        <RichTextEditor
                            toolbarConfig={toolbarConfig}
                            value={content}
                            onChange={this.onChange}
                            placeholder="Digite aqui o conteúdo"
                        />
                        <TextField
                            value={source}
                            onChange={this.handleChange('source')}
                            id="source"
                            label="Fonte(s)"
                            margin="normal"
                            multiline
                            rowsMax="10"
                            fullWidth
                            required
                        />
                        <TextField
                            value={competence}
                            onChange={this.handleChange('competence')}
                            id="competence"
                            label="Competências abordadas"
                            margin="normal"
                            multiline
                            rowsMax="10"
                            fullWidth
                            required
                        />
                        <Tooltip title="Selecione uma opção">
                            <FormControl required className={classes.formControl}>
                                <InputLabel htmlFor="discipline-input">Disciplina</InputLabel>
                                <Select
                                    value={discipline}
                                    onChange={this.handleChangeSelect}
                                    name="discipline"
                                    inputProps={{
                                        id: 'discipline-input',
                                    }}
                                >
                                    <MenuItem value="" disabled>
                                        Selecione uma opção
                                </MenuItem>
                                    <MenuItem value="history">História</MenuItem>
                                    <MenuItem value="art">Arte</MenuItem>
                                    <MenuItem value="interdisciplinary">Interdisciplinar</MenuItem>
                                </Select>
                                <FormHelperText>Disciplina abordada</FormHelperText>
                            </FormControl>
                        </Tooltip>
                        <Tooltip title="Selecione uma opção">
                            <FormControl required className={classes.formControl}>
                                <InputLabel htmlFor="isPublic-input">Conteúdo público</InputLabel>
                                <Select
                                    value={isPublic}
                                    onChange={this.handleChangeSelect}
                                    name="isPublic"
                                    inputProps={{
                                        id: 'isPublic-input',
                                    }}
                                >
                                    <MenuItem value="" disabled>
                                        Selecione uma opção
                                </MenuItem>
                                    <MenuItem value={1}>Sim</MenuItem>
                                    <MenuItem value={0}>Não</MenuItem>
                                </Select>
                                <FormHelperText>Permitir a reutilização desse conteúdo por outras pessoas</FormHelperText>
                            </FormControl>
                        </Tooltip>
                        <div className={classes.flex}>
                            <Tooltip title="Cancelar e voltar">
                                <Button
                                    component={Link}
                                    to={`/dashboard/${classroom !== null ? classroom.uid : ''}/content`}
                                    variant="outlined"
                                    disabled={isLoading === true || classroom === null}
                                    fullWidth={true}
                                    className={classes.marginLeft}>
                                    Cancelar
                            </Button>
                            </Tooltip>
                            <Tooltip title="Salvar">
                                <Button
                                    type="submit"
                                    variant="outlined"
                                    disabled={isLoading}
                                    fullWidth={true}
                                    className={classes.marginRight}>
                                    <If test={!isLoading}>
                                        Salvar
                                    </If>
                                    <If test={isLoading}>
                                        <CircularProgress size={20} thickness={7} />
                                    </If>
                                </Button>
                            </Tooltip>
                        </div>
                    </form>
                    <Snackbar
                        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                        open={openSnackbarAlert}
                        onClose={() => this.handleClose('openSnackbarAlert')}
                        autoHideDuration={6000}
                        ContentProps={{
                            'mensagem-alerta': 'message-alert',
                        }}
                        message={<span id="message-alert">Aguarde... carregando informações!</span>}
                    />
                    <Snackbar
                        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                        open={openSnackbarSuccess}
                        onClose={() => this.handleClose('openSnackbarSuccess')}
                        autoHideDuration={6000}
                        ContentProps={{
                            'mensagem-sucesso': 'message-success',
                        }}
                        message={<span id="message-success">Conteúdo salvo com sucesso!</span>}
                    />
                </Paper>
            </div >
        );
    }
}

Form.propTypes = {
    classes: PropTypes.object.isRequired,
    onChange: PropTypes.func,
};

const mapStateToProps = state => ({ user: state.user, classroom: state.classroom });
const mapDispatchToProps = dispatch => bindActionCreators({ doListClassroom }, dispatch);

export default compose(
    withStyles(styles),
    connect(mapStateToProps, mapDispatchToProps))(Form);