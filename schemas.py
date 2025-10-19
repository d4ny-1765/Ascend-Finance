from typing import List, Optional, Literal, Annotated
from enum import Enum
from pydantic import BaseModel, Field, conint, confloat, StringConstraints

class HelpType(str, Enum):
    investment = "investment"
    employer_retirement = "employer_retirement"

class EmploymentTenure(str, Enum):
    lt_3mo = "Less than three months"
    mo3_to_12 = "3-12 months"
    yr1_to_3 = "1-3 years"
    gt_3yr = "More than 3 years"

class MaritalStatus(str, Enum):
    single = "Single"
    married = "Married"
    separated = "Separated"
    divorced = "Divorced"
    widowed = "Widowed"

class RiskTolerance(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"

class Concern(str, Enum):
    benefits = "Understanding my company's benefits (insurance, 401k)"
    first_paycheck = "How to manage my first real paycheck"
    debt = "Paying off student loans/debt"
    emergency_fund = "Starting an emergency fund"
    big_purchase = "Saving for a big purchase (car, down payment)"
    start_investing = "Starting to invest for the future"
    budgeting = "Budgeting and tracking my spending"
    taxes = "Understanding taxes and withholdings"

class PlanOption(str, Enum):
    k401 = "401k"
    roth_401k = "roth_401k"
    hsa = "hsa"
    fsa = "fsa"
    other = "other"

USStateCode = Annotated[
    str,
    StringConstraints(
        pattern=r"^[A-Z]{2}$",
        strip_whitespace=True,
        to_upper=True,
        min_length=2,
        max_length=2,
    ),
]

class QuizAnswers(BaseModel):
    name: str
    age: conint(ge=16, le=100)
    employment_tenure: EmploymentTenure
    state: USStateCode
    salary: confloat(ge=0)
    marital_status: MaritalStatus
    help_type: HelpType
    top_concerns: List[Concern] = Field(default_factory=list)
    risk_tolerance: Optional[RiskTolerance] = None

class BenefitsDetails(BaseModel):
    employer_offers_health_insurance: Optional[bool] = None
    enrolled_in_health_insurance: Optional[Literal["Yes, I'm enrolled", "No, not yet"]] = None
    monthly_premium: Optional[confloat(ge=0)] = None
    employer_contributes_hsa_or_fsa: Optional[bool] = None
    employer_offers_retirement_plan: Optional[bool] = None
    employer_plan_options: List[PlanOption] = Field(default_factory=list)
    employer_match_percent: Optional[confloat(ge=0, le=100)] = None
    contributing_now: Optional[bool] = None
    current_monthly_contribution: Optional[confloat(ge=0)] = None

class SavingsGoalDetails(BaseModel):
    what_are_you_saving_for: Optional[str] = None
    target_amount: Optional[confloat(ge=0)] = None
    timeline_months: Optional[conint(ge=1, le=600)] = None

class HouseholdCashflow(BaseModel):
    monthly_take_home_pay: Optional[confloat(ge=0)] = None
    monthly_expenses: Optional[confloat(ge=0)] = None
    current_savings: Optional[confloat(ge=0)] = None
    notes: Optional[str] = None

class FormAnswers(BaseModel):
    cashflow: HouseholdCashflow = HouseholdCashflow()
    benefits: BenefitsDetails = BenefitsDetails()
    savings_goal: SavingsGoalDetails = SavingsGoalDetails()

class UserProfile(BaseModel):
    quiz: QuizAnswers
    form: FormAnswers

    @property
    def name(self) -> str: return self.quiz.name
    @property
    def age(self) -> int: return self.quiz.age
    @property
    def salary(self) -> float: return float(self.quiz.salary)
    @property
    def help_type(self) -> HelpType: return self.quiz.help_type