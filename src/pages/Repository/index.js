import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import api from '../../services/api';

import Container from '../../components/Container';
import { Loading, Owner, IssueList, FilterDiv } from './styles';

export default class Repository extends Component {
  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        repository: PropTypes.string,
      }),
    }).isRequired,
  };

  state = {
    repository: {},
    issues: [],
    loading: true,
    filter: 'all',
    pageNumber: 1,
  };

  async componentDidMount() {
    const { match } = this.props; // match receives parameters
    const repoName = decodeURIComponent(match.params.repository);
    const { filter } = this.state;

    const [repository, issues] = await Promise.all([
      api.get(`/repos/${repoName}`),
      api.get(`/repos/${repoName}/issues`, {
        params: {
          state: `${filter}`,
          per_page: 5,
        },
      }),
    ]);

    this.setState({
      repository: repository.data,
      issues: issues.data,
      loading: false,
    });
  }

  async componentDidUpdate() {
    const { match } = this.props; // match receives parameters
    const repoName = decodeURIComponent(match.params.repository);
    const { filter, pageNumber } = this.state;

    const issues = await api.get(`/repos/${repoName}/issues`, {
      params: {
        state: `${filter}`,
        per_page: 5,
        page: `${pageNumber}`,
      },
    });

    this.setState({
      issues: issues.data,
      loading: false,
    });
  }

  handleFilter = e => {
    if (e.target.value === 'all') {
      this.setState({
        filter: 'all',
      });
    } else if (e.target.value === 'open') {
      this.setState({
        filter: 'open',
      });
    } else {
      this.setState({
        filter: 'closed',
      });
    }
  };

  handleButton = e => {
    const { pageNumber } = this.state;
    let page = pageNumber;
    if (e.target.value === 'prev' && pageNumber > 1) {
      page -= 1;
    } else if (e.target.value === 'next') {
      page += 1;
    }
    this.setState({
      pageNumber: page,
    });
  };

  render() {
    const { repository, issues, loading, pageNumber } = this.state;

    if (loading) {
      return <Loading>Loading...</Loading>;
    }

    return (
      <Container>
        <Owner>
          <Link to="/">Back to repositories</Link>
          <img src={repository.owner.avatar_url} alt={repository.owner.login} />
          <h1>{repository.name}</h1>
          <p>{repository.description}</p>
        </Owner>
        <FilterDiv>
          <div id="filter">
            <label htmlFor="all">
              All
              <input
                id="all"
                type="radio"
                name="filter"
                value="all"
                onClick={this.handleFilter}
                defaultChecked
              />
              <span />
            </label>
            <label htmlFor="closed">
              Closed
              <input
                id="closed"
                type="radio"
                name="filter"
                value="closed"
                onClick={this.handleFilter}
              />
              <span />
            </label>
            <label htmlFor="open">
              Open
              <input
                id="open"
                type="radio"
                name="filter"
                value="open"
                onClick={this.handleFilter}
              />
              <span />
            </label>
          </div>
          <div>
            <button
              type="button"
              value="prev"
              disabled={pageNumber < 2}
              onClick={this.handleButton}
            >
              Prev
            </button>
            <button type="button" value="next" onClick={this.handleButton}>
              Next
            </button>
          </div>
        </FilterDiv>
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
      </Container>
    );
  }
}
