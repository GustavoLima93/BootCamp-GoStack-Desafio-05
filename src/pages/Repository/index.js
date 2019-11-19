/* eslint-disable react/static-property-placement */
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Proptypes from 'prop-types';
import api from '../../services/api';

import { Loading, Owner, IssueList, RadioButton, PaginateBtn } from './styles';
import Container from '../../components/Container';

export default class Repository extends Component {
  static propTypes = {
    match: Proptypes.shape({
      params: Proptypes.shape({
        repository: Proptypes.string,
      }),
    }).isRequired,
  };

  state = {
    repository: {},
    issues: [],
    loading: true,
    filter: 'all',
    page: 1,
  };

  async componentDidMount() {
    const { match } = this.props;
    const { filter, page } = this.state;

    const repoName = decodeURIComponent(match.params.repository);

    const [repository, issues] = await Promise.all([
      api.get(`/repos/${repoName}`),
      api.get(`/repos/${repoName}/issues`, {
        params: {
          state: filter,
          per_page: 5,
          page,
        },
      }),
    ]);

    this.setState({
      repository: repository.data,
      issues: issues.data,
      loading: false,
    });
  }

  handleFilter = async state => {
    const { match } = this.props;
    const repoName = decodeURIComponent(match.params.repository);

    try {
      const { data } = await api.get(`/repos/${repoName}/issues`, {
        params: {
          state,
          per_page: 5,
          page: 1,
        },
      });

      this.setState({ issues: data, filter: state, page: 1 });
    } catch (error) {
      console.error('Ocorreu um erro');
    }
  };

  handlePaginate = async () => {
    const { filter, page, issues } = this.state;

    const { match } = this.props;
    const repoName = decodeURIComponent(match.params.repository);

    try {
      const { data } = await api.get(`/repos/${repoName}/issues`, {
        params: {
          state: filter,
          per_page: 5,
          page: page + 1,
        },
      });

      this.setState({ issues: [...issues, ...data], page: page + 1 });
    } catch (error) {
      console.error('Ocorreu um erro');
    }
  };

  render() {
    const { repository, issues, loading, filter } = this.state;

    if (loading) {
      return <Loading>Carregando</Loading>;
    }

    return (
      <Container>
        <Owner>
          <Link to="/">Voltar aos repositórios</Link>
          <img src={repository.owner.avatar_url} alt={repository.owner.login} />
          <h1>{repository.name}</h1>
          <p>{repository.description}</p>
          {issues.length ? (
            <RadioButton btnColor={filter}>
              <button
                id="all"
                onClick={() => this.handleFilter('all')}
                type="button"
              >
                <span>All</span>
              </button>
              <button
                id="open"
                onClick={() => this.handleFilter('open')}
                type="button"
              >
                <span>Open</span>
              </button>
              <button
                id="closed"
                onClick={() => this.handleFilter('closed')}
                type="button"
              >
                <span>Closed</span>
              </button>
            </RadioButton>
          ) : (
            ''
          )}
        </Owner>
        <IssueList>
          {issues.map(issue => (
            <li key={String(issue.id)}>
              <img src={issue.user.avatar_url} alt={issue.user.login} />
              <div>
                <strong>
                  <a href={issue.html_url}>{issue.title}</a>
                  {issue.labels.map(label => (
                    <span key={String(label.id)}>{label.name}</span>
                  ))}
                </strong>
                <p>{issue.user.login}</p>
              </div>
            </li>
          ))}
        </IssueList>
        {issues.length ? (
          <PaginateBtn onClick={this.handlePaginate}>Carregar mais</PaginateBtn>
        ) : (
          ''
        )}
      </Container>
    );
  }
}
