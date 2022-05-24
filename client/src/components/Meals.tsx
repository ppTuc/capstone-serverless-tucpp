import { History } from 'history'
import update from 'immutability-helper'
import * as React from 'react'
import {
  Button,
  Checkbox,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Loader,
  Form
} from 'semantic-ui-react'

import { createMeal, deleteMeal, getMeals, patchMeal } from '../api/meals-api'
import Auth from '../auth/Auth'
import { Meal } from '../types/Meal'

interface MealsProps {
  auth: Auth
  history: History
}

interface MealsState {
  meals: Meal[]
  newMealName: string
  loadingMeals: boolean
  nameInput: string
  dayOfWeekInput: string
}

export class Meals extends React.PureComponent<MealsProps, MealsState> {
  state: MealsState = {
    meals: [],
    newMealName: '',
    loadingMeals: true,
    nameInput: '',
    dayOfWeekInput: ''
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newMealName: event.target.value })
  }

  onEditButtonClick = (mealId: string) => {
    this.props.history.push(`/meals/${mealId}/edit`)
  }

  onMealCreate = async (event: React.ChangeEvent<HTMLButtonElement>) => {
    try {
      const dayOfWeek = this.calculateDayOfWeek()
      const newMeal = await createMeal(this.props.auth.getIdToken(), {
        name: this.state.newMealName,
        dayOfWeek
      })
      this.setState({
        // newMeal will appear first in order
        meals: [newMeal, ...this.state.meals],
        newMealName: ''
      })
    } catch {
      alert('Meal creation failed')
    }
  }

  onMealDelete = async (mealId: string) => {
    try {
      await deleteMeal(this.props.auth.getIdToken(), mealId)
      this.setState({
        meals: this.state.meals.filter(meal => meal.mealId != mealId)
      })
    } catch {
      alert('Meal deletion failed')
    }
  }

  onMealCheck = async (pos: number) => {
    try {
      const meal = this.state.meals[pos]
      await patchMeal(this.props.auth.getIdToken(), meal.mealId, {
        name: meal.name,
        dayOfWeek: meal.dayOfWeek,
        eaten: !meal.eaten
      })
      this.setState({
        meals: update(this.state.meals, {
          [pos]: { eaten: { $set: !meal.eaten } }
        })
      })
    } catch {
      alert('Meal deletion failed')
    }
  }

  // DONE: Add interface to update 'name' and 'dayOfWeek'
  handleNameInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ nameInput: event.target.value })
  }

  handleDayOfWeekInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ dayOfWeekInput: event.target.value })
  }

  onMealNameUpdate = async (pos: number) => {
    try {
      const meal = this.state.meals[pos]
      await patchMeal(this.props.auth.getIdToken(), meal.mealId, {
        name: this.state.nameInput,
        dayOfWeek: meal.dayOfWeek,
        eaten: meal.eaten
      })
      this.setState({
        meals: update(this.state.meals, {
          [pos]: { name: { $set: this.state.nameInput } }
        })
      })
    } catch {
      alert('Meal deletion failed')
    }
  }

  onMealDayOfWeekUpdate = async (pos: number) => {
    try {
      const meal = this.state.meals[pos]
      await patchMeal(this.props.auth.getIdToken(), meal.mealId, {
        name: meal.name,
        dayOfWeek: this.state.dayOfWeekInput,
        eaten: meal.eaten
      })
      this.setState({
        meals: update(this.state.meals, {
          [pos]: { dayOfWeek: { $set: this.state.dayOfWeekInput } }
        })
      })
    } catch {
      alert('Meal deletion failed')
    }
  }
  // ------------------------------------------------------------------------------------


  async componentDidMount() {
    try {
      const meals = await getMeals(this.props.auth.getIdToken())
      this.setState({
        meals,
        loadingMeals: false
      })
    } catch (e) {
      alert(`Failed to fetch meals: ${e.message}`)
    }
  }

  render() {
    return (
      <div>
        <Header as="h1">My Meals</Header>

        {this.renderCreateMealInput()}

        {this.renderMeals()}
      </div>
    )
  }

  renderCreateMealInput() {
    return (
      <Grid.Row>
        <Grid.Column width={16}>
          <Input
            action={{
              color: 'teal',
              labelPosition: 'left',
              icon: 'add',
              content: 'New meal',
              onClick: this.onMealCreate
            }}
            fluid
            actionPosition="left"
            placeholder="Homemade meal... or order a takeaway"
            onChange={this.handleNameChange}
          />
        </Grid.Column>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
    )
  }

  renderMeals() {
    if (this.state.loadingMeals) {
      return this.renderLoading()
    }

    return this.renderMealsList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading My Meals
        </Loader>
      </Grid.Row>
    )
  }

  renderMealsList() {
    return (
      <Grid padded>
        {this.state.meals.map((meal, pos) => {
          return (
            <Grid.Row key={meal.mealId}>
              <Grid.Column width={1} verticalAlign="middle">
                <Checkbox
                  onChange={() => this.onMealCheck(pos)}
                  checked={meal.eaten}
                />
              </Grid.Column>
              <Grid.Column width={10} verticalAlign="middle">
                {meal.name}
              </Grid.Column>
              <Grid.Column width={3} floated="right">
                {meal.dayOfWeek}
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="blue"
                  onClick={() => this.onEditButtonClick(meal.mealId)}
                >
                  <Icon name="pencil" />
                </Button>
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="red"
                  onClick={() => this.onMealDelete(meal.mealId)}
                >
                  <Icon name="delete" />
                </Button>
              </Grid.Column>
              
              <Grid.Column width={16}>
                {meal.attachmentUrl && (
                  <Image src={meal.attachmentUrl} size="small" wrapped />
                )}
                <Divider />
              </Grid.Column>

              <Grid.Column width={8}>
                <Form onSubmit={() => this.onMealNameUpdate(pos)}>
                  <Form.Group inline>
                    <Form.Field>
                      <label>Name</label>
                      <input type='text' value={this.state.nameInput} onChange={this.handleNameInputChange} />
                    </Form.Field>
                    <Button icon color="blue" type='submit'>
                      <Icon name="pencil" />
                    </Button>
                  </Form.Group>
                </Form>
              </Grid.Column>
              <Grid.Column width={8}>
                <Form onSubmit={() => this.onMealDayOfWeekUpdate(pos)}>
                  <Form.Group inline>
                    <Form.Field>
                      <label>Day of Week</label>
                      <input type='text' value={this.state.dayOfWeekInput} onChange={this.handleDayOfWeekInputChange} />
                    </Form.Field>
                    <Button icon color="blue" type='submit'>
                      <Icon name="pencil" />
                    </Button>
                  </Form.Group>
                </Form>
              </Grid.Column>

              <Grid.Column width={16}>
                <Divider />
              </Grid.Column>
            </Grid.Row>
          )
        })}
      </Grid>
    )
  }

  calculateDayOfWeek(): string {
    const date = new Date()
    date.setDate(date.getDate() + 7)

    // Code from "calculateDueDate()" // return dateFormat(date, 'yyyy-mm-dd') as string
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    return days[date.getDay()]
  }
}
